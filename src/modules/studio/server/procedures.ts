import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import z from "zod";
import { db } from "@/db";
import {
  comments,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({
  // route for getting a specific video
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id } = input; // extract the id from the input
      const { id: userId } = ctx.user; // extract authenticated user id from context

      const [video] = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.id, id), // query the video that matches the id passed in the input
            eq(videos.userId, userId) // query the video that is owned by the authenticated user
          )
        );

      if (!video) throw new TRPCError({ code: "NOT_FOUND" }); // not sure if this should be the response, simply returning an empty list might be better for handling the UI more properly
      return video;
    }),
  // route for getting all videos
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          commentCount: db.$count(comments, eq(comments.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.type, "like"),
              eq(videoReactions.videoId, videos.id)
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  // query the database starting from the element after
                  // the last element fetched before using the cursor
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    // or fetch the element that has the same updatedAt
                    // as the cursor but also has a larger id, in case
                    // two videos where created at exactly the same time,
                    // (a very rare case)
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        // order by both descending "id" and "updatedAt" to
        // match the filtering inside the "WHERE" clause
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        // fetch an extra element than the limit to check
        // if this is the end or if there's still data
        .limit(limit + 1);

      // Check if there is more data
      const hasMore = data.length > limit;
      // Remove the extra element if there is more data, otherwise keep it
      const items = hasMore ? data.slice(0, -1) : data;

      // set the next cursor to the last item
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),
});

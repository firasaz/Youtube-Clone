import { createTRPCRouter, baseProcedure } from "@/trpc/init";

import z from "zod";
import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { and, desc, eq, getTableColumns, lt, not, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const suggestionsRouter = createTRPCRouter({
  // route for getting all videos
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, videoId } = input;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));
      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videoId)), // "videoId" here might need to be replaced with "videos.id"
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.type, "like")
            )
          ), // "videoId" here might need to be replaced with "videos.id"
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.type, "dislike")
            )
          ), // "videoId" here might need to be replaced with "videos.id"
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id)) // to add the user to the query result of the videos and use it in the select
        .where(
          and(
            // not(eq(videos.id, existingVideo.id)), // tutorial used this method but the below line also seems to work
            not(eq(videos.id, videoId)),
            eq(videos.visibility, "public"),
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId)
              : undefined,
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

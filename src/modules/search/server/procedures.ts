import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import z from "zod";
import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { and, desc, eq, getTableColumns, ilike, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const searchRouter = createTRPCRouter({
  // route for getting all videos based on query and category if provided
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(),
        categoryId: z.string().uuid().nullish(),
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
      const { cursor, limit, query, categoryId } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            ilike(videos.title, `%${query}%`),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
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

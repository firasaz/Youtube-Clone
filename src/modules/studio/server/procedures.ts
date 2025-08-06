import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import z from "zod";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { and, desc, eq, lt, or } from "drizzle-orm";

export const studioRouter = createTRPCRouter({
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
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.id))
        // fetch an extra element than the limit to check
        // if this is the end or if there's still data
        .limit(limit + 1);

      // Check if there is more data
      const hasMore = data.length > limit;
      // Remove the extra element if there is more data, otherwise keep it
      const items = hasMore ? data.slice(0, -1) : data;

      // set the next cursor to the last item if there was more data remaining
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

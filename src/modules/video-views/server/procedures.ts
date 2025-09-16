import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoViewsRouter = createTRPCRouter({
  // handle creating a new view, only logged in users can create views
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      //   query if the new view is already there by checking if the user already created a view before
      // i.e. every user can create only 1 view per video
      const [existingVideoView] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.videoId, videoId), eq(videoViews.userId, userId))
        );

      if (existingVideoView) return existingVideoView;

      //   if the current user doesn't have a previous view on this video,
      // insert a new record to create the view in the db
      const [createdvideoView] = await db
        .insert(videoViews)
        .values({ userId, videoId })
        .returning();
      return createdvideoView;
    }),
});

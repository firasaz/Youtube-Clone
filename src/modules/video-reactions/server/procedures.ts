import { db } from "@/db";
import { videoReactions, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionsRouter = createTRPCRouter({
  // handle creating a new lke reaction, only logged in users can create reactions
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      //   query if the new view is already there by checking if the user already created a view before
      // i.e. every user can create only 1 view per video
      const [existingVideoLikeReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        );

      // if previous like reaction exists, then the reaction should be toggled, deleting the like reaction of the user on the video
      if (existingVideoLikeReaction) {
        const [deletedVideoLikeReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId), // delete the record where the videoId matches the current video
              eq(videoReactions.userId, userId) // delete the record where the userId matches the current user doing the reaction
            )
          )
          .returning();
        return deletedVideoLikeReaction;
      }

      // if the current user doesn't have a previous like reaction on this video,
      // insert a new record to create the like reaction in the db
      const [createdVideoLikeReaction] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "like" })
        // this handles the conflict where a previous reaction on this video by the current user is done, yet it is not a like
        // in that case, the previous reaction is not detected in the 1st query as we only check for like and toggle it
        // but in case there is a dislike reaction before, a conflict will happen, and we handle it by updating the dislike reaction to a like in the appropriate table record
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "like",
          },
        })
        .returning();
      return createdVideoLikeReaction;
    }),
  // handle creating a new lke reaction, only logged in users can create reactions
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      //   query if the new view is already there by checking if the user already created a view before
      // i.e. every user can create only 1 view per video
      const [existingVideoDislikeReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "dislike")
          )
        );

      // if a previous "like" reaction exists, then the reaction should be toggled, deleting the "dislike" reaction of the user on the video
      if (existingVideoDislikeReaction) {
        const [deletedVideoDislikeReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId), // delete the record where the videoId matches the current video
              eq(videoReactions.userId, userId) // delete the record where the userId matches the current user doing the reaction
            )
          )
          .returning();
        return deletedVideoDislikeReaction;
      }

      // if the current user doesn't have a previous "dislike" reaction on this video,
      // insert a new record to create the "dislike" reaction in the db
      const [createdVideoLikeReaction] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "dislike" })
        // this handles the conflict where a previous reaction on this video by the current user is done, yet it is not a "dislike"
        // in that case, the previous reaction is not detected in the 1st query as we only check for "dislike" and toggle it
        // but in case there is a "like" reaction before, a conflict will happen, and we handle it by updating the "like" reaction to a like in the appropriate table record
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: {
            type: "dislike",
          },
        })
        .returning();
      return createdVideoLikeReaction;
    }),
});

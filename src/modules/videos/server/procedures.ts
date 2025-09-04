import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
        // mp4_support: "standard", // only valid with accounts with credit card registered
      },
      cors_origin: "*",
    });

    const [video] = await db
      .insert(videos)
      .values({
        title: "Untitled",
        userId,
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    return {
      video: video,
      url: upload.url,
    };
  }),

  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      // input, which is the videoUpdateSchema, can be modified to always include an id
      // or you can handle the case where id is not provided as done below
      if (!input.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video ID is required",
        });

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!updatedVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you do not have permission to update it",
        });

      return updatedVideo;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [removedVideo] = await db
        .delete(videos)
        .where(
          and(
            eq(videos.id, input.id), // find the video by id passed in the input of the remove procedure
            eq(videos.userId, userId) // ensure the user owns the video
          )
        )
        .returning();

      if (!removedVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you do not have permission to delete it",
        });

      return removedVideo;
    }),

  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      if (!input.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video ID is required",
        });

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      // make sure the video is found in the db and belongs to the authenticated user
      if (!existingVideo)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found or you do not have permission to update it",
        });
      // clean up "uploadthing" storage if there is a thumbnail already uploaded
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey); // delete the file from "uploadthing" storage and use restore the default MUX generated thumbnail
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }
      // make sure the video has a muxPlaybackId to generate the thumbnail URL
      if (!existingVideo.muxPlaybackId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video does not have a playback ID",
        });

      // use the MUX service to generate a thumbnail URL as done already be default
      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
      const utapi = new UTApi();
      const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

      if (!data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { key: thumbnailKey, url: thumbnailUrl } = data;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          thumbnailUrl,
          thumbnailKey,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),

  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      });

      return { workflowRunId };
    }),
});

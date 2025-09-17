import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { mux } from "@/lib/mux";
import { db } from "@/db";
import {
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
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

  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      });

      return { workflowRunId };
    }),

  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.id },
      });

      return { workflowRunId };
    }),

  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid(), prompt: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.id, prompt: input.prompt },
      });

      return { workflowRunId };
    }),

  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;
      let userId;

      // check if user is logged in and fetch them
      // we had to query the "users" table since "videoReactions" table references
      // the "users" table by db id not the clerkId
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));
      if (user) userId = user.id;

      // if user is found, do a subquery to fetch from the "videoReactions" table all records
      // for the currently logged in user, as only logged in users can create reactions
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );
      const [existingVideo] = await db
        .with(viewerReactions)
        .select({
          ...getTableColumns(videos), //spread the videos data
          user: {
            // add the user to the full sql query result
            ...getTableColumns(users), // spread the users data
          },
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // this way we added an extra element called "videoViews", and counted the videoViews table for all records of the videoId
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id), // query "videoReactions" table for all records linked to this video
              eq(videoReactions.type, "like") // query the "videoReactions" table for all records with "like" reactions
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id), // query "videoReactions" table for all records linked to this video
              eq(videoReactions.type, "dislike") // query the "videoReactions" table for all records with "like" reactions
            )
          ),
          viewerReaction: viewerReactions.type, // add a field for determining what the current user's reaction to the current video being queried is, if any
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .where(eq(videos.id, input.id))
        .groupBy(videos.id, users.id, viewerReactions.type);

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" });
      return existingVideo;
    }),
});

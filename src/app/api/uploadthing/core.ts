import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, videos } from "@/db/schema";

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ videoId: z.string().uuid() })) // set the input to accept a videoId property to identify which video the thumbnail is for
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("UNAUTHORIZED");

      // fetch the authenticated user from db using the clerkUserId
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));
      if (!user) throw new UploadThingError("UNAUTHORIZED");

      const [video] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      if (!video) throw new UploadThingError("NOT_FOUND");

      if (video.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(video.thumbnailKey); // delete the file from "uploadthing" storage and use the new uploaded thumbnail instead
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      }

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await db
        .update(videos)
        .set({
          thumbnailUrl: file.url,
          thumbnailKey: file.key, // store the thumbnail file key from "uploadthing" to manage cleanup later
        })
        .where(
          and(
            eq(videos.id, metadata.videoId), // query the video with id matching the "videoId" input field
            eq(videos.userId, metadata.user.id) // ensure the owner id for the video in question matches the user id
          )
        );

      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

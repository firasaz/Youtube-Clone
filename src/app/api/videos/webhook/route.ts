import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { mux } from "@/lib/mux";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";

import { UTApi } from "uploadthing/server";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;
const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET;

export const POST = async (req: Request) => {
  if (!SIGNING_SECRET) {
    throw new Error("MUX_WEBHOOK_SECRET is not set");
  }

  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");

  if (!muxSignature) {
    return new Response("No signature found", { status: 401 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      console.log("Asset created!");
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      // this shouldn't happen as it means MUX crashed and couldn't send back an id
      if (!data.upload_id)
        return new Response("No upload ID found", { status: 400 });

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.ready": {
      console.log("Asset ready!");
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playbackId = data.playback_ids?.[0].id;

      if (!data.upload_id)
        return new Response("No upload id found", { status: 400 });
      if (!playbackId)
        return new Response("Missing playback ID", { status: 400 });

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const utapi = new UTApi();
      const { data: uploadedThumbnail } = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );
      if (!uploadedThumbnail) {
        return new Response("Failed to upload thumbnail", { status: 500 });
      }
      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail;
      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          thumbnailUrl,
          thumbnailKey,
          previewUrl,
          duration,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.errored": {
      console.log("Asset errored!");
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];
      if (!data.upload_id)
        return new Response("Missing upload ID", { status: 400 });

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.deleted": {
      console.log("Asset deleted!");
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
      if (!data.upload_id)
        return new Response("Missing upload ID", { status: 400 });

      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
    case "video.asset.track.ready": {
      console.log("Asset track ready");
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      // Typescript incorrectly says asset_id does not exist
      const { asset_id: assetId, id: trackId, status: trackStatus } = data;

      if (!assetId) return new Response("Missing asset ID", { status: 400 });

      await db
        .update(videos)
        .set({
          muxTrackId: trackId,
          muxTrackStatus: trackStatus,
        })
        .where(eq(videos.muxAssetId, assetId));
    }
  }
  return new Response("Webhook received", { status: 200 });
};

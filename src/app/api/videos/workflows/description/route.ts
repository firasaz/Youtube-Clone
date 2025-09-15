import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

interface InputType {
  userId: string;
  videoId: string;
}
export const { POST } = serve(async (context) => {
  const BASE_URL = process.env.NGROK_URL;

  const input = (await context.requestPayload) as InputType;
  const { userId, videoId } = input;
  // Background job to fetch the video specified in the BODY
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo)
      throw new Error("Video not found or user unauthorized...");

    return existingVideo;
  });

  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = response.text();

    if (!text) throw new Error("Bad Request");
    return text;
  });

  // Background job to call local ollama model and generate AI-generated description
  const ollamaData = await context.run("call-ollama", async () => {
    const response = await fetch(`${BASE_URL}/api/ollama/description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
        prompt: transcript,
      }),
    });
    if (!response.ok)
      throw new Error(
        `Failed to call /api/ollama/description: ${response.statusText}`
      );

    console.log("'call-ollama' step ran");
    const data = await response.json();
    return data.response;
  });

  // Background job to update the video with the new AI-generated description
  await context.run("update-description", async () => {
    await db
      .update(videos)
      .set({
        description: ollamaData || video.description,
      })
      .where(
        and(
          eq(videos.id, video.id)
          // eq(videos.userId, video.userId)
        )
      );
    console.log("'update-description' step ran");
  });
});

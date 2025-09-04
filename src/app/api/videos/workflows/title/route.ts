import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}
export const { POST } = serve(async (context) => {
  const BASE_URL = process.env.NGROK_URL;

  const input = (await context.requestPayload) as InputType;
  const { userId, videoId } = input;
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!existingVideo)
      throw new Error("Video not found or user unauthorized...");

    return existingVideo;
  });

  const ollamaData = await context.run("call-ollama", async () => {
    const response = await fetch(`${BASE_URL}/api/ollama`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-r1:1.5b",
      }),
    });
    if (!response.ok)
      throw new Error(`Failed to call /api/ollama: ${response.statusText}`);

    console.log("'call-ollama' step ran");
    const data = await response.json();
    return data.response;
  });

  await context.run("update-title", async () => {
    await db
      .update(videos)
      .set({
        title: ollamaData || video.title,
      })
      .where(
        and(
          eq(videos.id, video.id)
          // eq(videos.userId, video.userId)
        )
      );
    console.log("'update-title' step ran");
  });
});

import { db } from "@/db";
import { videos } from "@/db/schema";
import { GoogleGenAI } from "@google/genai";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import * as fs from "node:fs";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const BASE_URL = process.env.NGROK_URL;
  const utapi = new UTApi();

  const input = (await context.requestPayload) as InputType;
  const { userId, videoId, prompt } = input;

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

  // Background job to call local ollama model and generate AI-generated image
  const geminiRes = await context.run("gemini-call", async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const { candidates } = await ai.models.generateContent({
      model: "imagen-3.0-generate-002",
      contents: prompt,
    });
    if (!candidates?.[0].content?.parts) throw new Error("Bad Request");
    const imageUrls = []
    for (const part of candidates[0].content.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        if (typeof imageData === "string") {
          const buffer = Buffer.from(imageData, "base64");
          const blob = new Blob([buffer], { type: "image/png" });
          const file = new File([blob], "image.png", { type: "image/png" });
          const uploaded = await utapi.uploadFiles(file);
          imageUrls.push(uploaded?.data?.url);
          console.log("Image saved as gemini-native-image.png");
        } else {
          throw new Error("Image data is undefined or not a string");
        }
      }
    }

    // Below is available for billed users only
    // const { generatedImages } = await ai.models.generateImages({
    //   model: 'imagen-3.0-generate-002',
    //   prompt,
    //   config: {
    //     numberOfImages: 1
    //   }
    // });
    // if(generatedImages && generatedImages?.length > 0) {
    //   let imgBytes = generatedImages[0]?.image?.imageBytes;
    //   if(imgBytes) {
    //     const buffer = Buffer.from(imgBytes, "base64");
    //     const blob = new Blob([buffer], { type: "image/png" });
    //     const file = new File([blob], "image.png", { type: "image/png" });
    //     const uploaded = await utapi.uploadFiles(file);
    //     imageUrls.push(uploaded?.data?.url);
    //   }
    // }
  });

  // const { body } = await context.api.openai.call(
  //   "generate-response-with-gemini", // A unique name for this step
  //   {
  //     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  //     token: process.env.GEMINI_API_KEY || "", // Use your Gemini API key here
  //     operation: "chat.completions.create",
  //     body: {
  //       model: "gemini-2.5-flash", // Use a compatible Gemini model
  //       messages: [
  //         {
  //           role: "system",
  //           content: "You are a cat lover",
  //         },
  //         {
  //           role: "user",
  //           content: "How awesome are cats?",
  //         },
  //       ],
  //     },
  //   }
  // );

  // console.log(body);
  // const tempThumbnailUrl = body.data[0].url;
  // if (!tempThumbnailUrl) throw new Error("Bad Request");

  // await context.run("cleanup-thumbnail", async () => {
  //   if (video.thumbnailKey) {
  //     await utapi.deleteFiles(video.thumbnailKey);
  //     await db
  //       .update(videos)
  //       .set({
  //         thumbnailKey: null,
  //         thumbnailUrl: null,
  //       })
  //       .where(
  //         and(
  //           eq(videos.id, videoId)
  //           // eq(videos.userId, userId)
  //         )
  //       );
  //   }
  // });

  // await context.run("upload-thumbnail", async () => {
  //   const { data, error } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

  //   if (error) throw new Error("Bad Request");
  // });

  // // Background job to update the video with the new AI-generated title
  // await context.run("update-title", async () => {
  //   await db
  //     .update(videos)
  //     .set({
  //       title: ollamaData || video.title,
  //     })
  //     .where(
  //       and(
  //         eq(videos.id, video.id)
  //         // eq(videos.userId, video.userId)
  //       )
  //     );
  //   console.log("'update-title' step ran");
  // });
});

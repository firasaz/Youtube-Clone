import { createTRPCRouter } from "@/trpc/init";

import { videoCategoriesRouter } from "@/modules/videoCategories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videoCategories: videoCategoriesRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

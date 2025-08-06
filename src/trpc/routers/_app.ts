import { createTRPCRouter } from "@/trpc/init";

import { videoCategoriesRouter } from "@/modules/videoCategories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videoCategories: videoCategoriesRouter,
  videos: videosRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

import { createTRPCRouter } from "../init";
import { videoCategoriesRouter } from "@/modules/videoCategories/server/procedures";

export const appRouter = createTRPCRouter({
  videoCategories: videoCategoriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

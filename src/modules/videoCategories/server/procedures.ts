import { db } from "@/db";
import { videoCategories } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const videoCategoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    return await db.select().from(videoCategories);
  }),
});

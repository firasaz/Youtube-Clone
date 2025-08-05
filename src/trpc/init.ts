import { cache } from "react";
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import superjson from "superjson";
import { ratelimit } from "@/lib/ratelimit";
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const { userId } = await auth();

  // extract and return the user token (jwt) only, since
  // the context will be triggered continously, then use the
  // extracted token later for db querying as needed
  return { clerkUserId: userId };
});
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// extend the baseProcedure to authenticate and return the authenticated user data
export const protectedProcedure = t.procedure.use(async function isAuthorized(
  opts
) {
  // verify clerk_id availability
  const { clerkUserId } = opts.ctx;
  if (!clerkUserId) throw new TRPCError({ code: "UNAUTHORIZED" });

  // use clerk_id to query the db, limit
  // to 1 for faster querying (not necessary tho)
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

  // utilize upstash redis rate limit to avoid spam requests
  const { success } = await ratelimit.limit(user.id);
  if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

  // extend the context for protected procedure
  // with the authenticated user data
  return opts.next({
    ctx: {
      ...opts.ctx,
      user,
    },
  });
});

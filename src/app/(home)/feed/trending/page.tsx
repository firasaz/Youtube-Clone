import { HydrateClient, trpc } from "@/trpc/server";
import { TrendingView } from "@/modules/home/ui/views/trending-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";
// interface PageProps {
//   searchParams: Promise<{
//     categoryId?: string;
//   }>;
// }

async function Page() {
  void trpc.videos.getTrending.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  );
}
export default Page;

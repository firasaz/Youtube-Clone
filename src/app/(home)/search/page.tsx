import { HydrateClient, trpc } from "@/trpc/server";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { ResultsSection } from "@/modules/search/ui/sections/results-sections";

import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    query: string;
    categoryId: string | undefined;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { query, categoryId } = await searchParams;

  void trpc.videoCategories.getMany.prefetch();
  void trpc.search.getMany.prefetchInfinite({
    query,
    categoryId,
    limit: DEFAULT_LIMIT,
  });

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
      <ResultsSection query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;

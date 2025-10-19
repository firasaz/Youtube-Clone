"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { DEFAULT_LIMIT } from "@/constants";
import { ErrorBoundary } from "react-error-boundary";

interface ResultsSectionProps {
  query: string | undefined;
  categoryId: string | undefined;
}

const ResultsSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-5 p-4 gap-y-10 pt-6 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export const ResultsSection = (props: ResultsSectionProps) => {
  return (
    // added query-categoryId combo as key to show loading state when
    // switching between new states that would be loading in the background
    <Suspense
      key={`${props.query}_${props.categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p>error...</p>}>
        <ResultsSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};
const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {
  const isMobile = useIsMobile();
  const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    {
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  return isMobile ? (
    <div className="flex flex-col gap-4 gap-y-10">
      {results.pages
        .flatMap(page => page.items)
        .map(video => (
          <VideoGridCard key={video.id} data={video} />
        ))}
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      {results.pages
        .flatMap(page => page.items)
        .map(video => (
          <VideoRowCard key={video.id} data={video} />
        ))}
      {/* {Array.from({ length: 5 }).map((_, index) => (
        <VideoRowCardSkeleton key={index} />
      ))} */}
      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        isFetchingNextPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </div>
  );
};

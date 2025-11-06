"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard } from "@/modules/videos/ui/components/video-grid-card";

interface HomeVideosSectionProps {
  categoryId?: string;
}

const HomeVideosSectionSkeleton = () => {
  return <div>loading...</div>;
};
export const HomeVideosSection = (props: HomeVideosSectionProps) => {
  return (
    <Suspense fallback={<HomeVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>error...</p>}>
        <HomeVideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

const HomeVideosSectionSuspense = ({ categoryId }: HomeVideosSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    {
      categoryId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.pages
        .flatMap(page => page.items)
        .map(video => (
          <VideoGridCard key={video.id} data={video} />
        ))}
    </div>
  );
};

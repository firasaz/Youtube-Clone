"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { PlaylistGridCard } from "../components/playlists-grid-card";

const PlaylistsSectionSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size={"compact"} />
        ))}
      </div>
    </>
  );
};
export const PlaylistsSection = () => {
  return (
    // supply the suspense with a key so that it refreshes the suspense everytime we change categories while the API is fetching the new videos
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>error...</p>}>
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistsSectionSuspense = () => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );
  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10">
        {playlists.pages.flatMap(page =>
          page.items.map(playlist => (
            <PlaylistGridCard key={playlist.id} data={playlist} />
          ))
        )}
      </div>
      {/* <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap(page => page.items)
          .map(video => (
            <VideoRowCard key={video.id} data={video} size={"compact"} />
          ))}
      </div> */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";

import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { toast } from "sonner";

interface VideosSecitonProps {
  playlistId: string;
}

const VideosSectionSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>

      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size={"compact"} />
        ))}
      </div>
    </>
  );
};
export const VideosSection = ({ playlistId }: VideosSecitonProps) => {
  return (
    // supply the suspense with a key so that it refreshes the suspense everytime we change categories while the API is fetching the new videos
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>error...</p>}>
        <VideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSectionSuspense = ({ playlistId }: VideosSecitonProps) => {
  const utils = trpc.useUtils();
  const [videos, query] = trpc.playlists.getCustom.useSuspenseInfiniteQuery(
    {
      playlistId,
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: data => {
      toast.success("video removed from playlist");
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getCustom.invalidate({ playlistId: data.playlistId });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap(page => page.items)
          .map(video => (
            <VideoGridCard
              key={video.id}
              data={video}
              onRemove={() =>
                removeVideo.mutate({ videoId: video.id, playlistId })
              }
            />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap(page => page.items)
          .map(video => (
            <VideoRowCard
              key={video.id}
              data={video}
              onRemove={() =>
                removeVideo.mutate({ videoId: video.id, playlistId })
              }
              size={"compact"}
            />
          ))}
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
};

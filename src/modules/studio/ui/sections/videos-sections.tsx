"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";
import { snakeCaseToTitle } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const VideosSection = () => (
  <Suspense fallback={<VideosSectionSkeleton />}>
    <ErrorBoundary fallback={<p>Error ...</p>}>
      <VideosSectionSuspense />
    </ErrorBoundary>
  </Suspense>
);
const VideosSectionSkeleton = () => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[510px]">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right pr-6">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
              {/* Video skeleton */}
              <TableCell className="pl-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-36" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </TableCell>
              {/* Visibility skeleton */}
              <TableCell>
                <Skeleton className="w-16 h-4" />
              </TableCell>
              {/* Status skeleton */}
              <TableCell>
                <Skeleton className="w-16 h-4" />
              </TableCell>
              {/* Date skeleton */}
              <TableCell>
                <Skeleton className="w-24 h-4" />
              </TableCell>
              {/* Views skeleton */}
              <TableCell className="text-right">
                <Skeleton className="w-12 h-4 ml-auto" />
              </TableCell>
              {/* Comments skeleton */}
              <TableCell className="text-right">
                <Skeleton className="w-12 h-4 ml-auto" />
              </TableCell>
              {/* Likes skeleton */}
              <TableCell className="text-right pr-6">
                <Skeleton className="w-12 h-4 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const handleQueryPaging = async () => {
    // console.log(query.fetchNextPage());
    const res = await query.fetchNextPage();
    console.log(res.data?.pages);
    // query.fetchNextPage;
  };

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages
              .flatMap((page) => page.items)
              .map((video) => (
                <Link
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior
                  id={video.id}
                >
                  <TableRow className="cursor-pointer">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <div className="aspect-video shrink-0 w-36 relative">
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl}
                            previewUrl={video.previewUrl}
                            duration={video.duration ?? 0}
                          />
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden gap-y-1">
                          <span className="text-sm line-clamp-1">
                            {video.title}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {video.description ??
                              "no description no description no description no description no description no description no description yoooooooooo yoooooo122222222 yooo yooo yoooo3333333333"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {video.visibility === "private" ? (
                          <LockIcon className="size-4 mr-2" />
                        ) : (
                          <Globe2Icon className="size-4 mr-2" />
                        )}
                        {snakeCaseToTitle(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{snakeCaseToTitle(video.muxStatus || "error")}</div>
                    </TableCell>
                    <TableCell className="text-sm truncate">{`${format(
                      new Date(video.createdAt),
                      "d MMM yyyy"
                    )} ${video.createdAt.toLocaleTimeString()}`}</TableCell>
                    <TableCell className="text-right">views</TableCell>
                    <TableCell className="text-right">comments</TableCell>
                    <TableCell className="text-right pr-6">likes</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={handleQueryPaging}
      />
    </div>
  );
};

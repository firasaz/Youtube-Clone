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

export const VideosSection = () => (
  <Suspense fallback={<p>Loading ...</p>}>
    <ErrorBoundary fallback={<p>Error ...</p>}>
      <VideosSectionSuspense />
    </ErrorBoundary>
  </Suspense>
);
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
              <TableHead>Views</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Likes</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="aspect-video shrink-0 w-36 relative">
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl}
                            previewUrl={video.previewUrl}
                            duration={video.duration ?? 0}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>
                      {`${video.createdAt.toLocaleDateString()} ${video.createdAt.toLocaleTimeString()}`}
                    </TableCell>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.title}</TableCell>
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

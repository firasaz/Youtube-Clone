"use client";

import MuxPlayer from "@mux/mux-player-react";
import { VideoThumbnail } from "./video-thumbnail";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoPlayerProps {
  playbackId?: string | null;
  thumbnailUrl?: string | null;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video bg-black rounded-xl" />;
};

export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  // if (!playbackId) return null;

  if (playbackId)
    return (
      <MuxPlayer
        playbackId={playbackId ?? ""}
        poster={thumbnailUrl || THUMBNAIL_FALLBACK}
        playerInitTime={0}
        autoPlay={autoPlay}
        thumbnailTime={0}
        className="w-full h-full object-contain"
        accentColor="#FF2056"
        onPlay={onPlay}
      />
    );
  return <VideoThumbnail duration={0} />;
};

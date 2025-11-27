import { cn } from "@/lib/utils";

interface PlaylistThumbnailProps {
  title: string;
  videoCount: number;
  className?: string;
  imageUrl?: string;
}

export const PlaylistThumbnail = ({
  title,
  videoCount,
  className,
  imageUrl,
}: PlaylistThumbnailProps) => {
  return (
    <div className={cn("relative pt-3 group", className)}>Thumbnail!!</div>
  );
};

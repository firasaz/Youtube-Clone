import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { VideoGetOneOutput } from "../../types";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface VideoReactionProps {
  videoId: string;
  likes: number;
  dislikes: number;
  viewerReaction: VideoGetOneOutput["viewerReaction"];
}
export const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReaction,
}: VideoReactionProps) => {
  const clerk = useClerk();
  const utils = trpc.useUtils();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
    },
    onError: (err) => {
      toast.error("Something went wrong...");

      if (err.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });
  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
    },
    onError: (err) => {
      toast.error("Something went wrong...");

      if (err.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  return (
    <div className="flex items-center flex-none">
      <Button
        variant={"secondary"}
        className="rounded-s-full rounded-e-none"
        onClick={() => like.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likes}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        variant={"secondary"}
        className="rounded-s-none rounded-e-full"
        onClick={() => dislike.mutate({ videoId })}
        disabled={like.isPending || dislike.isPending}
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikes}
      </Button>
    </div>
  );
};

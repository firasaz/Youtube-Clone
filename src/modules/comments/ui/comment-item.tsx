import Link from "next/link";
import { CommentsGetManyOutput } from "../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/trpc/client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { userId } = useAuth();
  const clerk = useClerk();

  const utils = trpc.useUtils();
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (err) => {
      toast.error("something went wrong...");

      if (err.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={"lg"}
            imageUrl={comment.users.imageUrl}
            name={comment.users.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
            <div className="flex items-end gap-2 mb-0.5">
              <span className="font-medium text-sm">{comment.users.name}</span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.value}</p>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>
            {comment.users.clerkId === userId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <div className="flex flex-col gap-2">
          <div className="font-semibold text-xs">{comment.users.name}</div>
          <div className="text-muted-foreground text-xs">
            {formatDistanceToNow(comment.createdAt, {
              addSuffix: true,
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
};

import { useUser, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";

import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";

interface CommentsFormProps {
  videoId: string;
  onSuccess?: () => void;
}

export const CommentsForm = ({ videoId, onSuccess }: CommentsFormProps) => {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const utils = trpc.useUtils();
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      toast.success("Comment added");
      onSuccess?.();
    },
    onError: (err) => {
      toast.error("Something went wrong...");
      if (err.data?.code === "UNAUTHORIZED") openSignIn();
    },
  });
  const form = useForm<z.infer<typeof commentInsertSchema>>({
    resolver: zodResolver(commentInsertSchema.omit({ userId: true })), // set "userId" not to be passed from frontend
    defaultValues: {
      videoId,
      value: "",
    },
  });
  const handleSubmit = (values: z.infer<typeof commentInsertSchema>) => {
    console.log("submitting...");
    create.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex gap-4 group"
      >
        <UserAvatar
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          size={"lg"}
          name={user?.username || "User"}
        />
        <div className="flex-1">
          <FormField
            name="value"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add a comment..."
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="justify-end gap-2 mt-2 flex">
            <Button type="submit" size={"sm"} disabled={create.isPending}>
              Comment
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

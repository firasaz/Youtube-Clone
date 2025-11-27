import { ResponsiveModal } from "@/components/responsive-modal";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface PlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  name: z.string().min(1),
});

export const PlaylistCreateModal = ({
  open,
  onOpenChange,
}: PlaylistCreateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const utils = trpc.useUtils();
  const createPlaylist = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created");
      form.reset();
      onOpenChange(false);
      utils.playlists.getMany.invalidate();
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    createPlaylist.mutate(values);

  return (
    <ResponsiveModal
      title="Create a playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="My favorite videos" />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={createPlaylist.isPending}>
              {createPlaylist.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

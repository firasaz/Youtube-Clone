"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "@/modules/studio/ui/components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";

import { APP_URL } from "@/constants";

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error...</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side */}
        <div className="space-y-8 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[220px] w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Right Side */}
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col bg-[#f9f9f9] rounded-lg overflow-hidden h-fit">
            <Skeleton className="aspect-video" />
            <div className="p-4 flex flex-col gap-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.videoCategories.getMany.useSuspenseQuery(); // this could be done in its own component to handle suspense and loading of the caegories separate from the videos

  const router = useRouter();

  const utils = trpc.useUtils();
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });

      console.log("success");
      toast.success("Video updated successfully!");
    },
    onError: err => {
      // the error message can be changed into a generic message
      // instead of displaying the backend error message as is
      toast.error(err.message);
    },
  });
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      // utils.studio.getOne.invalidate({ id: videoId });

      console.log("remove success");
      toast.success("Video deleted successfully!");
      router.push("/studio");
    },
    onError: err => {
      // the error message can be changed into a generic message
      // instead of displaying the backend error message as is
      toast.error(err.message);
    },
  });

  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video revalidated!");
    },
    onError: err => {
      toast.error(err.message);
    },
  });

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Background Job Started", {
        description: "This may take some time",
      });
    },
  });
  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Background Job Started", {
        description: "This may take some time",
      });
    },
  });
  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });

      toast.success("Thumbnail restored successfully!");
    },
    onError: err => {
      // the error message can be changed into a generic message
      // instead of displaying the backend error message as is
      toast.error(err.message);
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data);
  };
  // // the below is an alternative way, though not complete, to handle the UI
  // // while the form is submitting using the rhf form object
  // const onSubmit = async(data: z.infer<typeof videoUpdateSchema>) => {
  //   await update.mutateAsync(data);
  //   // form.formState.isSubmitting
  // };

  const [thumbnailGenerateOpen, setThumbnailGenerateOpen] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);

  const fullUrl = `${APP_URL}/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };
  return (
    <>
      <ThumbnailGenerateModal
        open={thumbnailGenerateOpen}
        onOpenChange={setThumbnailGenerateOpen}
        videoId={videoId}
      />
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video Details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                disabled={update.isPending || !form.formState.isDirty}
              >
                Save
                {update.isPending && (
                  <Loader2Icon className="size-3 animate-spin" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"}>
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                  >
                    <RotateCwIcon className="size-4 mr-2" />
                    Revalidate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left side */}
            <div className="space-y-8 lg:col-span-3">
              {/* Title form field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Title
                        <Button
                          size="icon"
                          variant="outline"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          disabled={
                            generateTitle.isPending || !video.muxTrackId
                          }
                        >
                          {generateTitle.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Description form field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Description
                        <Button
                          size="icon"
                          variant="outline"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() =>
                            generateDescription.mutate({ id: videoId })
                          }
                          disabled={
                            generateDescription.isPending || !video.muxTrackId
                          }
                        >
                          {generateDescription.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10"
                        placeholder="Add a description to your video"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Thumbnail form field */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative group h-[150px] w-[250px]">
                        <Image
                          src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          fill
                          alt="thumbnail"
                          className="object-cover"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size={"icon"}
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            {/* Change thumbnail */}
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className="size-4" />
                              Change
                            </DropdownMenuItem>
                            {/* AI-generated */}
                            <DropdownMenuItem
                              onClick={() => setThumbnailGenerateOpen(true)}
                            >
                              <SparklesIcon className="size-4" />
                              AI-generated
                            </DropdownMenuItem>
                            {/* Restore */}
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                            >
                              <RotateCwIcon className="size-4" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Category form field */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            {/* Right side */}
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col bg-[#f9f9f9] rounded-lg overflow-hidden h-fit">
                {/* Video Preview Player */}
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                {/* Thumbnail Video Details */}
                <div className="p-4 flex flex-col gap-y-4">
                  {/* Video URL */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-muted-foreground text-xs">
                        Video link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500 hover:underline">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant={"ghost"}
                          size={"icon"}
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Video Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "preparing")}
                      </p>
                    </div>
                  </div>
                  {/* Subtitles Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitles status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no_subtitles"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Visibility form */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-x-2">
                            <Globe2Icon className="size-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-x-2">
                            <LockIcon className="size-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

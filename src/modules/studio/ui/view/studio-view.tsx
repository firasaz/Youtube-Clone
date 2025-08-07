import { VideosSection } from "../sections/videos-sections";

export const StudioView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">My Channel</h1>
        <div className="text-xs text-muted-foreground">
          Manage your channel content and videos
        </div>
      </div>
      <VideosSection />
    </div>
  );
};

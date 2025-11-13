import { TrendingVideosSection } from "../sections/trending-videos-section";

export const TrendingView = () => {
  return (
    <div className="flex flex-col gap-y-6 px-4 pt-2.5 mx-auto mb-10 max-w-[2400px]">
      <div>
        <h1 className="text-2xl font-bold">Trending</h1>
        <p className="text-xs text-muted-foreground">
          Most popular videos at the moment
        </p>
      </div>
      <TrendingVideosSection />
    </div>
  );
};

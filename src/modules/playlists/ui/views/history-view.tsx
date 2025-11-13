import { HistoryVideosSection } from "../sections/history-videos-section";

export const HistoryView = () => {
  return (
    <div className="flex flex-col gap-y-6 px-4 pt-2.5 mx-auto mb-10 max-w-screen-md">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-xs text-muted-foreground">Videos you have watched</p>
      </div>
      <HistoryVideosSection />
    </div>
  );
};

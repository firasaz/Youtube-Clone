import { SubscribedVideosSection } from "../sections/subscribed-videos-section";

export const SubscriptionsView = () => {
  return (
    <div className="flex flex-col gap-y-6 px-4 pt-2.5 mx-auto mb-10 max-w-[2400px]">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-xs text-muted-foreground">
          Videos from your favorite creators
        </p>
      </div>
      <SubscribedVideosSection />
    </div>
  );
};

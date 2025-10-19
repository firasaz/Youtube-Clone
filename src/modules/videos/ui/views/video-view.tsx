import { VideoSection } from "@/modules/videos/ui/sections/video-section";
import { SuggestionsSection } from "../sections/suggestions-section";
import CommentsSection from "../sections/comments-section";

interface VideoViewProps {
  videoId: string;
}

const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
          <div className="lg:hidden block mt-4">
            <SuggestionsSection videoId={videoId} isManual={true} />
          </div>
          <CommentsSection videoId={videoId} />
        </div>
        <div className="hidden lg:block w-1/4 xl:w-1/3">
          <SuggestionsSection videoId={videoId} />
        </div>
      </div>
    </div>
  );
};

export default VideoView;

import PlatformBadge from "@/app/components/content/PlatformBadge";
import {Platform, PlatformType, SuggestedTopic} from "@/app/types/types";

const API_PLATFORM_TO_UI: Record<SuggestedTopic["recommendedPlatform"], PlatformType> = {
    BLOG: Platform.BLOG,
    LINKEDIN: Platform.LINKEDIN,
    TWITTER: Platform.TWITTER,
    INSTAGRAM: Platform.INSTAGRAM,
};

type SuggestedTopicCardProps = Readonly<{
    suggestedTopic: SuggestedTopic;
    isNew?: boolean;
    onDetailClick: (suggestedTopic: SuggestedTopic) => void;
}>;

function SuggestedTopicCard({suggestedTopic, isNew, onDetailClick}: SuggestedTopicCardProps) {
    return (
        <div className={`card bg-base-100 border shadow-xs flex flex-col transition-all duration-300 ${isNew ? "border-primary/30 ring-1 ring-primary/20" : "border-base-300"}`}>
            <div className="card-body p-5 gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2">{suggestedTopic.topic}</h3>
                    <div className="flex items-center gap-2 text-xs text-base-content/40">
                        <span>{new Date(suggestedTopic.createdAt).toLocaleDateString("fr-FR")}</span>
                        <span>•</span>
                        <PlatformBadge platform={API_PLATFORM_TO_UI[suggestedTopic.recommendedPlatform]}/>
                    </div>
                </div>

                <p className="text-sm text-base-content/60 leading-relaxed line-clamp-4 flex-1">
                    {suggestedTopic.topicDescription}
                </p>

                <button onClick={() => onDetailClick(suggestedTopic)} className="btn btn-outline btn-sm rounded-full w-full mt-1">
                    Voir les détails
                </button>
            </div>
        </div>
    );
}

export default SuggestedTopicCard;

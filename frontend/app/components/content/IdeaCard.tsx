import PlatformBadge from "@/app/components/content/PlatformBadge";
import {ContentIdea} from "@/app/types/types";

function IdeaCard({idee, isNew, onDetailClick}: { idee: ContentIdea; isNew?: boolean; onDetailClick: (idee: ContentIdea) => void }) {
    return (
        <div className={`card bg-base-100 border shadow-xs flex flex-col transition-all duration-300 ${isNew ? "border-primary/30 ring-1 ring-primary/20" : "border-base-300"}`}>
            <div className="card-body p-5 gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2">{idee.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-base-content/40">
                        <span>{idee.createdAt}</span>
                        <span>•</span>
                        <PlatformBadge platform={idee.platform}/>
                    </div>
                </div>

                <p className="text-sm text-base-content/60 leading-relaxed line-clamp-4 flex-1">
                    {idee.description}
                </p>

                <button onClick={() => onDetailClick(idee)} className="btn btn-outline btn-sm rounded-full w-full mt-1">
                    Voir les détails
                </button>
            </div>
        </div>
    );
}

export default IdeaCard;
import {Platform, PlatformType} from "@/app/types/types";

function PlatformBadge({platform}: { platform: PlatformType }) {
    const styles: Record<PlatformType, string> = {
        [Platform.LINKEDIN]: "bg-blue-100 text-blue-700",
        [Platform.INSTAGRAM]: "bg-purple-100 text-purple-700",
        [Platform.BLOG]: "bg-yellow-100 text-yellow-700",
        [Platform.TWITTER]: "bg-cyan-100 text-cyan-700",
    };
    return (
        <span className={`badge badge-soft badge-sm font-medium ${styles[platform]}`}>
      {platform}
    </span>
    );
}

export default PlatformBadge;
import { ContentStatus, StatusLabels } from "@/app/types/types";

interface StatusBadgeProps {
    status: ContentStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<ContentStatus, string> = {
        [ContentStatus.PUBLISHED]: "badge-success bg-success/10 text-success border-success/20",
        [ContentStatus.DRAFT]: "badge-ghost bg-base-200 text-base-content/70",
        [ContentStatus.WAITING_PUBLISH]: "badge-info bg-info/10 text-info border-info/20",
    };

    return (
        <span className={`badge badge-sm font-medium ${styles[status] || "badge-ghost"}`}>
            {StatusLabels[status] || status}
        </span>
    );
}
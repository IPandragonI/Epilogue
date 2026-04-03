import { Status, StatusType } from "@/app/types/types";

function StatusBadge({ status }: { status: StatusType }) {
    const styles: Record<StatusType, string> = {
        [Status.PUBLISHED]: "badge-success",
        [Status.DRAFT]: "badge-warning",
        [Status.SYNCING]: "badge-info",
    };

    return (
        <span className={`badge badge-soft badge-sm font-medium ${styles[status]}`}>
      {status}
    </span>
    );
}

export default StatusBadge;

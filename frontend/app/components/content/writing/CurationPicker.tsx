"use client";

import {useEffect, useState} from "react";
import {Newspaper} from "lucide-react";
import {CurationItems, AgencySubscription} from "@/app/types/types";
import CurationSelectionModal from "@/app/components/content/CurationSelectionModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Props = {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    subscription: AgencySubscription | null;
    curationUsedThisMonth: number;
    onRefreshQuota: () => Promise<void>;
};

export default function CurationPicker({selectedIds, onChange, subscription, curationUsedThisMonth, onRefreshQuota}: Props) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<CurationItems[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshingQuota, setRefreshingQuota] = useState(false);

    const maxCuration = subscription?.subscriptionPlan?.maxCurationPerMonth || 0;
    const remainingQuota = Math.max(maxCuration - curationUsedThisMonth, 0);
    const maxSelectable = Math.min(remainingQuota, maxCuration);

    const handleOpen = async () => {
        setRefreshingQuota(true);
        try {
            await onRefreshQuota();
        } finally {
            setRefreshingQuota(false);
            setOpen(true);
        }
    };

    useEffect(() => {
        if (!open) return;
        const fetchItems = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/curation-item/mine`, {credentials: "include", cache: "no-store"});
                if (!res.ok) throw new Error();
                setItems(await res.json());
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                disabled={maxCuration === 0 || refreshingQuota}
                className="btn btn-outline btn-sm w-full gap-2 rounded-lg justify-between"
                title={maxCuration === 0 ? "Curation non incluse dans votre abonnement" : undefined}
            >
                <span className="flex items-center gap-2">
                    {refreshingQuota ? <span className="loading loading-spinner loading-xs"/> : <Newspaper size={13}/>}
                    Sources de curation
                </span>
                {selectedIds.length > 0 && <span className="badge badge-sm badge-neutral">{selectedIds.length}</span>}
            </button>

            {open && !loading && (
                <CurationSelectionModal
                    items={items}
                    selectedIds={selectedIds}
                    maxSelectable={maxSelectable}
                    quotaLabel={`${remainingQuota} restant${remainingQuota > 1 ? "s" : ""} ce mois-ci sur ${maxCuration}`}
                    onClose={() => setOpen(false)}
                    onApply={(ids) => { onChange(ids); setOpen(false); }}
                />
            )}
        </>
    );
}
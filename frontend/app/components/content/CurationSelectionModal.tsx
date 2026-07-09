"use client";

import {useMemo, useState} from "react";
import {Search, X} from "lucide-react";
import {CurationItems} from "@/app/types/types";

const DEFAULT_MAX_SELECTABLE = 8;

type CurationSelectionModalProps = Readonly<{
    items: CurationItems[];
    selectedIds: string[];
    maxSelectable?: number;
    quotaLabel?: string;
    onClose: () => void;
    onApply: (selectedIds: string[]) => void;
}>;

export default function CurationSelectionModal({
                                                   items,
                                                   selectedIds,
                                                   maxSelectable = DEFAULT_MAX_SELECTABLE,
                                                   quotaLabel,
                                                   onClose,
                                                   onApply,
                                               }: CurationSelectionModalProps) {
    const [query, setQuery] = useState("");
    const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return items;
        return items.filter((item) => {
            const haystack = `${item.title} ${item.summary ?? ""} ${item.source?.name ?? ""}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [items, query]);

    const toggleSelection = (id: string) => {
        setLocalSelectedIds((currentIds) => {
            if (currentIds.includes(id)) return currentIds.filter((currentId) => currentId !== id);
            if (currentIds.length >= maxSelectable) return currentIds;
            return [...currentIds, id];
        });
    };

    const headerLabel = quotaLabel ?? `${maxSelectable} ressource${maxSelectable > 1 ? "s" : ""} maximum`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
            <div className="bg-base-100 border border-base-300 shadow-xl rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-base-300 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold">Choisir les ressources de contexte</h2>
                        <p className="text-sm text-base-content/50 mt-1">{headerLabel}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-xs btn-square shrink-0"><X size={16}/></button>
                </div>

                <div className="px-5 py-4 border-b border-base-300 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <label className="input input-bordered input-sm flex items-center gap-2 rounded-full flex-1 min-w-0">
                        <Search size={14} className="text-base-content/40 shrink-0"/>
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une ressource" className="grow text-sm"/>
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setLocalSelectedIds(items.slice(0, maxSelectable).map((i) => i.id))} className="btn btn-ghost btn-xs" disabled={maxSelectable === 0}>Tout sélectionner</button>
                        <button onClick={() => setLocalSelectedIds([])} className="btn btn-ghost btn-xs">Effacer</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
                    {filteredItems.length ? filteredItems.map((item) => {
                        const checked = localSelectedIds.includes(item.id);
                        const isDisabled = !checked && localSelectedIds.length >= maxSelectable;
                        return (
                            <label key={item.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${checked ? "border-accent bg-base-200 cursor-pointer" : isDisabled ? "border-base-300 bg-base-100 opacity-40 cursor-not-allowed" : "border-base-300 bg-base-100 hover:bg-base-200 cursor-pointer"}`}>
                                <input type="checkbox" checked={checked} disabled={isDisabled} onChange={() => toggleSelection(item.id)} className="checkbox checkbox-sm checkbox-accent mt-0.5"/>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
                                    {item.summary && <p className="text-xs text-base-content/55 line-clamp-2 mt-1">{item.summary}</p>}
                                    {item.source?.name && <p className="text-xs text-base-content/35 mt-2 line-clamp-1">{item.source.name}</p>}
                                </div>
                            </label>
                        );
                    }) : (
                        <div className="text-sm text-base-content/50 text-center py-8">Aucune ressource ne correspond à la recherche.</div>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-base-300 flex items-center justify-between gap-3">
                    <p className="text-sm text-base-content/50">{localSelectedIds.length}/{maxSelectable} ressource{localSelectedIds.length > 1 ? "s" : ""} sélectionnée{localSelectedIds.length > 1 ? "s" : ""}</p>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="btn btn-ghost btn-sm">Annuler</button>
                        <button onClick={() => onApply(localSelectedIds)} className="btn btn-accent btn-sm rounded-lg">Appliquer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
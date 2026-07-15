"use client";

import { useState, useRef, useCallback } from "react";
import { X, Link, Rss, FileText, Zap, Upload, Check, Sparkles, AlertCircle } from "lucide-react";
import {useAuth} from "@/app/hooks/useAuth";
import {CreateCurationItemDto} from "@/app/types/types";

type TabType = "url" | "rss" | "file";

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (
        data: ResourceFormData,
        result?: { success: boolean; message?: string; item?: any },
    ) => void;
}

export interface ResourceFormData {
    tab: TabType;
    url?: string;
    rssUrl?: string;
    file?: File | null;
    useAsImmediateContext: boolean;
}

interface RssFeedItem {
    title: string;
    link: string;
    summary: string;
    pubDate?: string;
}

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "url", label: "URL", icon: <Link size={14} strokeWidth={1.8} /> },
    { id: "rss", label: "Flux RSS", icon: <Rss size={14} strokeWidth={1.8} /> },
    { id: "file", label: "Fichier (PDF/Doc)", icon: <FileText size={14} strokeWidth={1.8} /> },
];

function unwrapApiItem(json: any): any {
    if (json && typeof json === "object" && "data" in json) {
        return json.data;
    }
    return json;
}

export function NewResourceModal({isOpen, onClose, onSubmit}: AddResourceModalProps) {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("url");
    const [url, setUrl] = useState("");
    const [rssUrl, setRssUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [useAsContext, setUseAsContext] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // upload states (URL/file)
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<{ title: string; summary: string } | null>(null);

    // RSS states
    const [rssFeedTitle, setRssFeedTitle] = useState("");
    const [rssItems, setRssItems] = useState<RssFeedItem[]>([]);
    const [rssFetchLoading, setRssFetchLoading] = useState(false);
    const [rssFetchError, setRssFetchError] = useState<string | null>(null);
    const [selectedRssLinks, setSelectedRssLinks] = useState<string[]>([]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const handleFetchRss = async () => {
        const trimmed = rssUrl.trim();
        if (!trimmed) return;

        setRssFetchLoading(true);
        setRssFetchError(null);
        setRssItems([]);
        setSelectedRssLinks([]);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/ai/parse-rss`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: trimmed }),
                credentials: 'include',
            });

            const json = await res.json().catch(() => null);

            if (!res.ok) {
                const err = json?.message || 'Impossible de récupérer le flux RSS';
                setRssFetchError(typeof err === 'string' ? err : JSON.stringify(err));
                return;
            }

            const data = json?.data;
            setRssFeedTitle(data?.feedTitle ?? '');
            setRssItems(Array.isArray(data?.items) ? data.items : []);

            if (!data?.items?.length) {
                setRssFetchError("Aucun article trouvé dans ce flux.");
            }
        } catch (e: unknown) {
            const err = e as Error;
            setRssFetchError(err?.message ?? String(e));
        } finally {
            setRssFetchLoading(false);
        }
    };

    const toggleRssItem = (link: string) => {
        setSelectedRssLinks((current) =>
            current.includes(link) ? current.filter((l) => l !== link) : [...current, link]
        );
    };

    const handleSubmit = async () => {
        if (activeTab === "file" && file) {
            if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
                setUploadLoading(true);
                setUploadError(null);
                setUploadResult(null);
                try {
                    const form = new FormData();
                    form.append('file', file);
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/ai/upload`, {
                        method: 'POST',
                        body: form,
                        credentials: 'include',
                    });

                    const json = await res.json().catch(() => null);
                    if (!res.ok) {
                        const err = json?.message || json || 'Upload failed';
                        const errMsg = typeof err === 'string' ? err : JSON.stringify(err);
                        setUploadError(errMsg);
                        onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                        return;
                    }

                    if (json) {
                        setUploadResult({title: json.title ?? file.name, summary: json.summary ?? ''});

                        const body : CreateCurationItemDto = {
                            title: String(json.title ?? file.name),
                            summary: String(json.summary ?? ''),
                            userId: String(user.id),
                            source: {
                                name: String(json.fileName),
                                sourceType: "PDF",
                                sourceUrl: String(file.name),
                            }
                        }

                        const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/curation-item`, {
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(body),
                            credentials: 'include',
                        });

                        const res2Json = await res2.json().catch(() => null);
                        const createdItem = unwrapApiItem(res2Json);

                        if (!res2.ok) {
                            const errMsg = res2Json?.message ? (Array.isArray(res2Json.message) ? res2Json.message.join(', ') : res2Json.message) : `Erreur ${res2.status}`;
                            setUploadError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
                            onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                        } else {
                            onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: true, message: 'Ressource créée', item: createdItem });
                        }
                    } else {
                        const errMsg = 'Upload succeeded but no data returned';
                        setUploadError(errMsg);
                        onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                    }
                } catch (e: unknown) {
                    const err = e as Error;
                    const errMsg = err?.message ?? String(e);
                    setUploadError(errMsg);
                    onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                } finally {
                    setUploadLoading(false);
                }
                return;
            }

            onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext});
            return;
        } else if (activeTab === "url" && url) {
            setUploadLoading(true);
            setUploadError(null);
            setUploadResult(null);
            try {
                const trimmed = (url || '').trim();
                if (!trimmed) return;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/ai/generate-from-website`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: trimmed }),
                    credentials: 'include',
                });

                const json = await res.json().catch(() => null);
                const data = json?.data;

                if (!res.ok) {
                    const err = data?.message || json || 'Scan failed';
                    const errMsg = typeof err === 'string' ? err : JSON.stringify(err);
                    setUploadError(errMsg);
                    onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                    return;
                }

                if (data) {
                    setUploadResult({title: data.title, summary: data.summary});

                    const body : CreateCurationItemDto = {
                        title: String(data.title),
                        summary: String(data.summary),
                        userId: String(user.id),
                        source: {
                            name: String(data.fileName),
                            sourceType: "URL",
                            sourceUrl: url,
                        }
                    }

                    const res2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/curation-item`, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                        credentials: 'include',
                    });

                    const res2Json = await res2.json().catch(() => null);
                    const createdItem = unwrapApiItem(res2Json);

                    if (!res2.ok) {
                        const errMsg = res2Json?.message ? (Array.isArray(res2Json.message) ? res2Json.message.join(', ') : res2Json.message) : `Erreur ${res2.status}`;
                        setUploadError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
                        onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                    } else {
                        onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: true, message: 'Ressource créée', item: createdItem });
                    }
                } else {
                    const errMsg = 'Upload succeeded but no data returned';
                    setUploadError(errMsg);
                    onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                }
            } catch (e: unknown) {
                const err = e as Error;
                const errMsg = err?.message ?? String(e);
                setUploadError(errMsg);
                onSubmit?.({tab: activeTab, file, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
            } finally {
                setUploadLoading(false);
            }

            // Note: ne pas appeler onSubmit une seconde fois ici,
            // le résultat a déjà été notifié dans le try/catch ci-dessus.
            return;
        } else if (activeTab === "rss" && selectedRssLinks.length) {
            setUploadLoading(true);
            setUploadError(null);

            try {
                const selectedItems = rssItems.filter((item) => selectedRssLinks.includes(item.link));
                const createdItems: any[] = [];
                let quotaExceeded = false;
                let failureMessage: string | null = null;

                for (const item of selectedItems) {
                    let sourceName = rssFeedTitle;
                    try {
                        if (!sourceName) sourceName = new URL(item.link).hostname;
                    } catch {
                        sourceName = sourceName || 'Flux RSS';
                    }

                    const body: CreateCurationItemDto = {
                        title: item.title,
                        summary: item.summary,
                        userId: String(user.id),
                        source: {
                            name: sourceName,
                            sourceType: "RSS",
                            sourceUrl: item.link,
                        },
                    };

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/curation-item`, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                        credentials: 'include',
                    });

                    const resJson = await res.json().catch(() => null);

                    if (!res.ok) {
                        if (res.status === 403) {
                            quotaExceeded = true;
                            failureMessage = resJson?.message ?? "Quota de curation atteint";
                            break;
                        }

                        const errMsg = resJson?.message
                            ? (Array.isArray(resJson.message) ? resJson.message.join(', ') : resJson.message)
                            : `Erreur ${res.status}`;
                        failureMessage = typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg);
                        continue;
                    }

                    createdItems.push(unwrapApiItem(resJson));
                }

                // On ne renvoie jamais un tableau dans `item` :
                // le panneau de détail attend une seule ressource.
                const firstItem = createdItems.length > 0 ? createdItems[0] : undefined;

                if (createdItems.length === selectedItems.length) {
                    onSubmit?.(
                        {tab: activeTab, rssUrl, useAsImmediateContext: useAsContext},
                        { success: true, message: `${createdItems.length} ressource(s) ajoutée(s)`, item: firstItem },
                    );
                } else if (createdItems.length > 0) {
                    const partialMsg = quotaExceeded
                        ? `${createdItems.length}/${selectedItems.length} ajoutée(s), quota de curation atteint pour le reste`
                        : `${createdItems.length}/${selectedItems.length} ajoutée(s), ${failureMessage ?? "une erreur est survenue pour les autres"}`;
                    setUploadError(partialMsg);
                    onSubmit?.(
                        {tab: activeTab, rssUrl, useAsImmediateContext: useAsContext},
                        { success: true, message: partialMsg, item: firstItem },
                    );
                } else {
                    const errMsg = failureMessage ?? "Aucune ressource n'a pu être ajoutée";
                    setUploadError(errMsg);
                    onSubmit?.({tab: activeTab, rssUrl, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
                }
            } catch (e: unknown) {
                const err = e as Error;
                const errMsg = err?.message ?? String(e);
                setUploadError(errMsg);
                onSubmit?.({tab: activeTab, rssUrl, useAsImmediateContext: useAsContext}, { success: false, message: errMsg });
            } finally {
                setUploadLoading(false);
            }
            return;
        }

        onSubmit?.({
            tab: activeTab,
            url: activeTab === "url" ? url : undefined,
            rssUrl: activeTab === "rss" ? rssUrl : undefined,
            file: activeTab === "file" ? file : null,
            useAsImmediateContext: useAsContext,
        });
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const isSubmitDisabled =
        uploadLoading ||
        loading ||
        (activeTab === "url" && !url.trim()) ||
        (activeTab === "file" && !file) ||
        (activeTab === "rss" && !selectedRssLinks.length);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="
                bg-base-100
                border border-base-300
                flex flex-col
                overflow-hidden
                shadow-xl

                w-full rounded-t-2xl h-[420px]
                sm:rounded-2xl sm:w-4/5 sm:max-h-[90vh]
                md:w-3/5
                lg:w-2/5
            ">

                <div className="px-5 sm:px-6 pt-5 pb-3 shrink-0">
                    <div className="sm:hidden w-10 h-1 rounded-full bg-base-content/20 mx-auto mb-4"/>

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                <Sparkles size={16} strokeWidth={1.8}/>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-base-content">
                                    Ajouter une ressource
                                </h2>
                                <p className="text-xs text-base-content/50 mt-0.5">
                                    Enrichissez votre base de connaissances pour la génération IA
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-xs btn-square mt-0.5 shrink-0 text-base-content/40 hover:text-base-content/70"
                        >
                            <X size={16}/>
                        </button>
                    </div>

                    <div className="flex gap-1 mt-4 bg-base-200 rounded-lg p-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center justify-center gap-1.5 flex-1 px-3 py-1.5
                                    text-xs sm:text-sm font-medium rounded-md
                                    transition-colors cursor-pointer whitespace-nowrap
                                    ${activeTab === tab.id
                                    ? "bg-base-100 text-epilogue-navy shadow-sm"
                                    : "text-base-content/50 hover:text-base-content/80"
                                }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-5 sm:px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1">

                    {activeTab === "url" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-base-content/70">
                                URL de la ressource
                            </label>
                            <div className="flex flex-1">
                                <div className="flex items-center gap-2 input input-bordered input-sm flex-1 min-w-0 px-3 focus-within:border-accent">
                                    <Rss size={14} className="text-base-content/30 shrink-0" strokeWidth={1.8}/>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://techcrunch.com"
                                        className="flex-1 min-w-0 text-sm bg-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "rss" && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-base-content/70">
                                URL du flux RSS
                            </label>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 input input-bordered input-sm flex-1 min-w-0 px-3 focus-within:border-accent">
                                    <Rss size={14} className="text-base-content/30 shrink-0" strokeWidth={1.8}/>
                                    <input
                                        type="url"
                                        value={rssUrl}
                                        onChange={(e) => setRssUrl(e.target.value)}
                                        placeholder="https://techcrunch.com/feed/"
                                        className="flex-1 min-w-0 text-sm bg-transparent outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleFetchRss}
                                    disabled={!rssUrl.trim() || rssFetchLoading}
                                    className="btn btn-sm btn-neutral gap-1.5 shrink-0"
                                >
                                    {rssFetchLoading ? (
                                        <span className="loading loading-spinner loading-xs"/>
                                    ) : (
                                        <Zap size={13} strokeWidth={2}/>
                                    )}
                                    <span className="hidden xs:inline">Récupérer</span>
                                </button>
                            </div>

                            {rssFetchError && (
                                <p className="text-xs text-red-500">{rssFetchError}</p>
                            )}

                            {rssItems.length > 0 && (
                                <div className="flex flex-col gap-1.5 mt-1">
                                    <p className="text-xs text-base-content/50">
                                        {selectedRssLinks.length} article{selectedRssLinks.length > 1 ? "s" : ""} sélectionné{selectedRssLinks.length > 1 ? "s" : ""} sur {rssItems.length}
                                    </p>
                                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                                        {rssItems.map((item) => {
                                            const checked = selectedRssLinks.includes(item.link);
                                            return (
                                                <label
                                                    key={item.link}
                                                    className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                                                        checked ? "border-accent bg-accent/5" : "border-base-300 bg-base-100 hover:border-accent/40"
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                                        checked ? "bg-accent border-accent" : "border-base-content/30"
                                                    }`}>
                                                        {checked && <Check size={10} className="text-base-100"/>}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleRssItem(item.link)}
                                                        className="hidden"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium leading-tight line-clamp-1">{item.title}</p>
                                                        {item.summary && (
                                                            <p className="text-xs text-base-content/50 mt-0.5 line-clamp-1">{item.summary}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "file" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-base-content/70">
                                Importer un document
                            </label>
                            <DropZone
                                file={file}
                                isDragging={isDragging}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onFileChange={handleFileChange}
                                fileInputRef={fileInputRef}
                            />

                            {uploadLoading && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="loading loading-spinner loading-xs text-accent"/>
                                    <p className="text-xs text-base-content/60">Envoi du fichier…</p>
                                </div>
                            )}
                            {uploadError && (
                                <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-red-500/10 text-red-600">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                                    <p className="text-xs">{uploadError}</p>
                                </div>
                            )}
                            {uploadResult && (
                                <div className="mt-2 p-3 bg-base-200 rounded-lg border border-base-300 flex flex-col gap-2">
                                    <div>
                                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Titre détecté</p>
                                        <p className="text-sm text-base-content">{uploadResult.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Résumé</p>
                                        <p className="text-sm text-base-content/70">{uploadResult.summary}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "rss" && uploadError && (
                        <p className="text-xs text-red-500">Erreur : {uploadError}</p>
                    )}
                </div>

                <div
                    className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-base-300 bg-base-200/40 shrink-0">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-accent btn-sm gap-2"
                        disabled={isSubmitDisabled}
                    >
                        {uploadLoading ? <span className="loading loading-spinner loading-xs"/> : null}
                        Ajouter la ressource
                    </button>
                </div>
            </div>
        </div>
    );
}

interface DropZoneProps {
    file: File | null;
    isDragging: boolean;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function DropZone({ file, isDragging, onDrop, onDragOver, onDragLeave, onFileChange, fileInputRef }: DropZoneProps) {
    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
                flex flex-col items-center justify-center gap-2
                rounded-xl border-2 border-dashed
                py-6 sm:py-8
                cursor-pointer transition-colors
                ${isDragging
                ? "border-accent bg-accent/10"
                : "border-base-300 hover:border-accent/50 bg-base-200/30"
            }
            `}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-accent/20 text-accent" : "bg-base-200 text-base-content/50"}`}>
                <Upload size={18} strokeWidth={1.8} />
            </div>
            {file ? (
                <p className="text-sm font-medium text-accent text-center px-4 break-all">
                    {file.name}
                </p>
            ) : (
                <>
                    <p className="text-sm font-bold text-base-content text-center">
                        Glissez-déposez vos fichiers
                    </p>
                    <p className="text-xs text-base-content/50 text-center">
                        PDF, DOCX ou TXT jusqu&apos;à 20MB
                    </p>
                </>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={onFileChange}
                className="hidden"
            />
        </div>
    );
}
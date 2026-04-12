"use client";

import { useState, useRef, useCallback } from "react";
import { X, Link, Rss, FileText, Zap, Upload } from "lucide-react";

type TabType = "url" | "rss" | "file";

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: ResourceFormData) => void;
}

export interface ResourceFormData {
    tab: TabType;
    url?: string;
    rssUrl?: string;
    file?: File | null;
    useAsImmediateContext: boolean;
}

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "url", label: "URL", icon: <Link size={14} strokeWidth={1.8} /> },
    { id: "rss", label: "Flux RSS", icon: <Rss size={14} strokeWidth={1.8} /> },
    { id: "file", label: "Fichier (PDF/Doc)", icon: <FileText size={14} strokeWidth={1.8} /> },
];

export default function NewResourceModal({ isOpen, onClose, onSubmit }: AddResourceModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>("url");
    const [url, setUrl] = useState("");
    const [rssUrl, setRssUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [useAsContext, setUseAsContext] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSubmit = () => {
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
            onClick={handleBackdropClick}
        >
            {/*
                Mobile  : bottom sheet (rounded top corners, full width, auto height)
                Desktop : centered modal (rounded, 2/5 width, fixed height)
            */}
            <div className="
                bg-accent
                flex flex-col
                overflow-hidden
                shadow-xl

                w-full rounded-t-2xl max-h-[92dvh]
                sm:rounded-2xl sm:w-4/5 sm:max-h-[90vh]
                md:w-3/5
                lg:w-2/5
            ">

                {/* ── Header ── */}
                <div className="px-5 sm:px-6 pt-5 pb-3 shrink-0">
                    {/* Mobile drag handle */}
                    <div className="sm:hidden w-10 h-1 rounded-full bg-base-content/20 mx-auto mb-4" />

                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-bold text-base-content">
                                Ajouter une ressource
                            </h2>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                Enrichissez votre base de connaissances pour la génération IA
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-xs btn-square mt-0.5 shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-0 mt-4 border-b border-base-300">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-1.5 px-3 sm:px-4 py-2
                                    text-xs sm:text-sm font-medium
                                    border-b-2 transition-colors -mb-px cursor-pointer whitespace-nowrap
                                    ${activeTab === tab.id
                                    ? "border-epilogue-navy text-epilogue-navy"
                                    : "border-transparent text-base-content/50 hover:text-base-content/80"
                                }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Body (scrollable on mobile if content overflows) ── */}
                <div className="px-5 sm:px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1">

                    {/* URL tab */}
                    {activeTab === "url" && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-base-content/70">
                                    URL de la ressource
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://exemple.com/mon-super-article-seo"
                                        className="input input-bordered input-sm flex-1 text-sm min-w-0"
                                    />
                                    <button className="btn btn-sm btn-neutral gap-1.5 shrink-0">
                                        <Zap size={13} strokeWidth={2} />
                                        <span className="hidden xs:inline">Récupérer</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-base-content/70">
                                    Ou importer un document
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
                            </div>
                        </>
                    )}

                    {/* RSS tab */}
                    {activeTab === "rss" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-base-content/70">
                                URL du flux RSS
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={rssUrl}
                                    onChange={(e) => setRssUrl(e.target.value)}
                                    placeholder="https://techcrunch.com/feed/"
                                    className="input input-bordered input-sm flex-1 text-sm min-w-0"
                                />
                                <button className="btn btn-sm btn-neutral gap-1.5 shrink-0">
                                    <Zap size={13} strokeWidth={2} />
                                    <span className="hidden xs:inline">Récupérer</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File tab */}
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
                        </div>
                    )}

                    {/* Use as immediate context checkbox */}
                    <label className="flex items-start gap-3 bg-base-100 border border-base-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-base-200 transition-colors">
                        <input
                            type="checkbox"
                            checked={useAsContext}
                            onChange={(e) => setUseAsContext(e.target.checked)}
                            className="checkbox checkbox-sm mt-0.5 shrink-0"
                        />
                        <div>
                            <p className="text-sm font-semibold text-base-content">
                                Utiliser comme contexte immédiat
                            </p>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                L'IA analysera cette ressource pour vos prochaines créations de contenu.
                            </p>
                        </div>
                    </label>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-black bg-accent-content/30 shrink-0">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-neutral btn-sm gap-2"
                    >
                        Ajouter la ressource
                        <span className="text-base leading-none">+</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* DropZone sub-component                                               */
/* ------------------------------------------------------------------ */
interface DropZoneProps {
    file: File | null;
    isDragging: boolean;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
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
                : "border-base-content/20 hover:border-base-content/40 bg-base-100/30"
            }
            `}
        >
            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                <Upload size={18} className="text-base-content/50" strokeWidth={1.8} />
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
                        PDF, DOCX ou TXT jusqu'à 20MB
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

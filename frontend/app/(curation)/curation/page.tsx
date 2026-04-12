"use client";

import {
    Rss,
    FileText,
    Newspaper,
    Link,
    ChevronRight,
    Plus,
    ArrowLeft,
} from "lucide-react";
import { CurationItems } from "@/app/types/types";
import { useState } from "react";
import NewResourceModal from "@/app/components/modal/NewResourceModal";

const CONTENTS: CurationItems[] = [
    {
        id: 1,
        title: "Guide SEO 2026 : Les tendances à suivre pour booster votre référencement",
        lastFetchedAt: "1/11/2050",
        summary: "Summary of Fresh News Article 2",
        source: {
            id: 1,
            name: "TechCrunch",
            sourceUrl: "https://techcrunch.com",
            sourceType: "RSS",
            lastFetchedAt: "1/11/2050",
            createdAt: "1/11/2050",
        },
    },
    {
        id: 2,
        title: "oqsudhozaedef",
        lastFetchedAt: "1/11/2050",
        summary: "Summary of Fresh News Article 2",
        source: {
            id: 1,
            name: "TechCrunch",
            sourceUrl: "https://techcrunch.com",
            sourceType: "RSS",
            lastFetchedAt: "1/11/2050",
            createdAt: "1/11/2050",
        },
    },
    {
        id: 3,
        title: "Guide SEO 2026 : Les tendances à suivre pour booster votre référencement",
        lastFetchedAt: "1/11/2050",
        summary: "Summary of Fresh News Article 2",
        source: {
            id: 1,
            name: "TechCrunch",
            sourceUrl: "https://techcrunch.com",
            sourceType: "LINK",
            lastFetchedAt: "1/11/2050",
            createdAt: "1/11/2050",
        },
    },
    {
        id: 4,
        title: "Guide SEO 2026 : Les tendances à suivre pour booster votre référencement",
        lastFetchedAt: "1/11/2050",
        summary: "Summary of Fresh News Article 2",
        source: {
            id: 1,
            name: "TechCrunch",
            sourceUrl: "https://techcrunch.com",
            sourceType: "NEWSPAPER",
            lastFetchedAt: "1/11/2050",
            createdAt: "1/11/2050",
        },
    },
];

function getIconForSourceType(sourceType?: string) {
    const type = (sourceType || "").toUpperCase();
    const commonProps = { size: 28, className: "text-base-content/30" } as const;

    switch (type) {
        case "RSS":
            return <Rss {...commonProps} color="red" />;
        case "NEWS":
        case "ARTICLE":
        case "NEWSPAPER":
            return <Newspaper {...commonProps} color="green" />;
        case "SITE":
        case "WEBSITE":
        case "WEB":
        case "LINK":
            return <Link {...commonProps} color="orange" />;
        default:
            return <FileText {...commonProps} color="blue" />;
    }
}

/* ------------------------------------------------------------------ */
/* Detail panel — shared between mobile drawer and desktop sidebar     */
/* ------------------------------------------------------------------ */
function ResourceDetail({ resource }: { resource: CurationItems }) {
    return (
        <div className="card-body p-5 gap-5">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">{resource.title}</h3>
            </div>

            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                    Résumé
                </p>
                <p className="text-sm text-base-content/80">{resource.summary}</p>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                    Nuage de mots clés
                </p>
                <div className="flex flex-wrap gap-2">
                    {["SEO", "Référencement", "Google", "Backlinks", "Contenu"].map((keyword) => (
                        <span
                            key={keyword}
                            className="text-xs bg-base-200 text-base-content/80 px-2 py-1 rounded"
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function CurationPage() {
    const [resourceSelected, setResourceSelected] = useState<CurationItems | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // On mobile, when a resource is selected we show the detail view instead of the list
    const [mobileShowDetail, setMobileShowDetail] = useState(false);

    const handleSelectResource = (content: CurationItems) => {
        setResourceSelected(content);
        setMobileShowDetail(true);
    };

    const handleBackToList = () => {
        setMobileShowDetail(false);
    };

    return (
        <div className="flex flex-col gap-5 max-w-full">

            {/* ── Header ── */}
            <div className="flex gap-2 items-center">
                <div className="w-3/5">
                    {/* Back button visible on mobile when detail is open */}
                    {mobileShowDetail && (
                        <button
                            onClick={handleBackToList}
                            className="md:hidden flex items-center gap-1 text-sm text-base-content/60 mb-2 hover:text-base-content transition-colors"
                        >
                            <ArrowLeft size={15} /> Retour
                        </button>
                    )}
                    <h1 className="text-2xl font-display font-bold underline-offset-2">
                        Curation de ressources
                    </h1>
                    <p className="hidden sm:block text-sm text-base-content/60">
                        Gérer et organiser vos sources de connaissances pour alimenter votre création de contenu
                    </p>
                </div>
                <div className="w-2/5 flex justify-end align-middle">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn bg-accent text-accent-content hover:bg-accent-hover transition-colors flex items-center gap-2 px-3 py-2 rounded-md text-sm"
                    >
                        <Plus size={16} />
                        {/* Hide label on very small screens */}
                        <span className="hidden xs:inline">Ajouter une source</span>
                        <span className="xs:hidden">Ajouter</span>
                    </button>
                </div>
            </div>

            {/* ── Modal ── */}
            <NewResourceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => {
                    console.log(data);
                    setIsModalOpen(false);
                }}
            />

            {/* ── Main content ── */}
            <div className="flex flex-row w-full gap-5 h-[80vh]">

                {/* LIST — hidden on mobile when detail is shown */}
                <div
                    className={`
                        flex flex-col gap-4 p-2 sm:p-4
                        w-full md:w-3/5
                        ${mobileShowDetail ? "hidden md:flex" : "flex"}
                    `}
                >
                    {CONTENTS.map((content) => (
                        <div
                            key={content.id}
                            onClick={() => handleSelectResource(content)}
                            className={`
                                border-base-300 bg-base-100 hover:bg-base-200
                                transition-colors transform duration-150
                                flex-row items-center justify-between
                                rounded-md border p-3 flex cursor-pointer
                                ${resourceSelected?.id === content.id
                                ? "bg-base-200 border-accent shadow-md scale-[1.01]"
                                : ""}
                            `}
                            aria-selected={resourceSelected?.id === content.id}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1 rounded-2xl min-w-10 min-h-10 flex items-center justify-center shrink-0">
                                    {getIconForSourceType(content.source?.sourceType)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-base sm:text-lg truncate max-w-[180px] sm:max-w-xs">
                                        {content.title}
                                    </p>
                                    <p className="font-medium text-xs sm:text-sm truncate max-w-[180px] sm:max-w-xs text-base-content/60">
                                        {content.summary}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <button className="btn btn-ghost btn-xs btn-square">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DETAIL PANEL */}
                <div
                    className={`
                        shrink-0 flex flex-col gap-4
                        w-full md:w-2/5
                        ${mobileShowDetail ? "flex" : "hidden md:flex"}
                    `}
                >
                    <div className="card bg-base-100 border border-base-300 shadow-xs min-h-full">
                        {resourceSelected ? (
                            <ResourceDetail resource={resourceSelected} />
                        ) : (
                            <div className="card-body p-5 gap-5 flex items-center justify-center">
                                <p className="text-sm text-base-content/50 text-center">
                                    Sélectionnez une ressource pour voir les détails
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

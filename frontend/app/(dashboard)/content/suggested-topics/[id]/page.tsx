"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft, PenLine} from "lucide-react";
import {Platform, PlatformConfig, SuggestedTopic} from "@/app/types/types";

const API_PLATFORM_TO_UI = {
    BLOG: Platform.BLOG,
    LINKEDIN: Platform.LINKEDIN,
    TWITTER: Platform.TWITTER,
    INSTAGRAM: Platform.INSTAGRAM,
} as const;

const SUGGESTED_TOPIC: SuggestedTopic = {
    id: "seed-idea-1",
    topic: "Le SEO en 2026 : Ce qui fonctionne vraiment",
    topicDescription: "Le référencement évolue rapidement. Découvrez les stratégies SEO réellement efficaces en 2026 pour améliorer votre visibilité, attirer du trafic qualifié et rester compétitif face aux nouvelles exigences des moteurs de recherche. De l'importance du contenu de qualité à l'impact de l'IA, explorez les tendances clés qui façonnent le paysage du SEO et comment les intégrer dans votre stratégie digitale.",
    recommendedPlatform: "LINKEDIN",
    userId: "seed-user",
    createdAt: "2026-01-11T00:00:00.000Z",
    updatedAt: "2026-01-11T00:00:00.000Z",
};

export default function IdeeDetailPage() {
    const router = useRouter();
    const uiPlatform = API_PLATFORM_TO_UI[SUGGESTED_TOPIC.recommendedPlatform];
    const config = PlatformConfig[uiPlatform];

    const handleEdit = () => {
        router.push(`/content/writing?idea=${SUGGESTED_TOPIC.id}`);
    };

    return (
        <div className="flex flex-col gap-6 max-w-full h-full">
            <div className="flex items-center gap-2">
                <Link href="/content/ideas"
                    className="flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors"
                >
                    <ArrowLeft size={14}/>
                    Génération d&apos;idées
                </Link>
                <span className="text-base-content/30 text-sm">›</span>
                <span className="text-sm text-base-content/40 line-clamp-1">{SUGGESTED_TOPIC.topic}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 flex-1">
                <div className="flex-1 flex flex-col gap-4">
                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-6 gap-4">
                            <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                                  {config.icon}
                                    {uiPlatform}
                                </span>
                                <span className="text-xs text-base-content/40">{new Date(SUGGESTED_TOPIC.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>

                            <h1 className="text-xl font-bold font-display leading-snug">
                                {SUGGESTED_TOPIC.topic}
                            </h1>

                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {SUGGESTED_TOPIC.topicDescription}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-5 gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-base-content/40">
                                Actions
                            </h2>

                            <button
                                onClick={handleEdit}
                                className="btn btn-primary btn-sm w-full gap-2 rounded-full"
                            >
                                <PenLine size={14}/>
                                Rédiger ce contenu
                            </button>
                        </div>
                    </div>

                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-5 gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-base-content/40">
                                Plateforme cible
                            </h2>
                            <div className={`flex items-center gap-2 text-sm font-medium ${config.color}`}>
                                {config.icon}
                                {uiPlatform}
                            </div>
                            <p className="text-xs text-base-content/40 leading-relaxed">
                                {uiPlatform === Platform.LINKEDIN &&
                                    "Format court à moyen, ton professionnel, accroche forte, 1 hashtag par thème."}
                                {uiPlatform === Platform.INSTAGRAM &&
                                    "Visuel fort, légende courte et engageante, 5–10 hashtags pertinents."}
                                {uiPlatform === Platform.BLOG &&
                                    "Article long format (+800 mots), structuré en Hn, optimisé SEO on-page."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
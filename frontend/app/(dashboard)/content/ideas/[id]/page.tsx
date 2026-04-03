"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft, PenLine} from "lucide-react";
import {ContentIdea, Platform, PlatformConfig} from "@/app/types/types";

const IDEA: ContentIdea = {
    id: 1,
    title: "Le SEO en 2026 : Ce qui fonctionne vraiment",
    createdAt: "11 Jan 2022",
    platform: Platform.LINKEDIN,
    description: "Le référencement évolue rapidement. Découvrez les stratégies SEO réellement efficaces en 2026 pour améliorer votre visibilité, attirer du trafic qualifié et rester compétitif face aux nouvelles exigences des moteurs de recherche. De l'importance du contenu de qualité à l'impact de l'IA, explorez les tendances clés qui façonnent le paysage du SEO et comment les intégrer dans votre stratégie digitale."
};

export default function IdeeDetailPage() {
    const router = useRouter();
    const config = PlatformConfig[IDEA.platform];

    const handleEdit = () => {
        router.push(`/content/writing?idea=${IDEA.id}`);
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
                <span className="text-sm text-base-content/40 line-clamp-1">{IDEA.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 flex-1">
                <div className="flex-1 flex flex-col gap-4">
                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-6 gap-4">
                            <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                                  {config.icon}
                                    {IDEA.platform}
                                </span>
                                <span className="text-xs text-base-content/40">{IDEA.createdAt}</span>
                            </div>

                            <h1 className="text-xl font-bold font-display leading-snug">
                                {IDEA.title}
                            </h1>

                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {IDEA.description}
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
                                {IDEA.platform}
                            </div>
                            <p className="text-xs text-base-content/40 leading-relaxed">
                                {IDEA.platform === Platform.LINKEDIN &&
                                    "Format court à moyen, ton professionnel, accroche forte, 1 hashtag par thème."}
                                {IDEA.platform === Platform.INSTAGRAM &&
                                    "Visuel fort, légende courte et engageante, 5–10 hashtags pertinents."}
                                {IDEA.platform === Platform.BLOG &&
                                    "Article long format (+800 mots), structuré en Hn, optimisé SEO on-page."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
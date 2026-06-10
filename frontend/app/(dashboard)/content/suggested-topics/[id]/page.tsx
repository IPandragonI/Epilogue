"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {notFound, useParams, useRouter} from "next/navigation";
import {ArrowLeft, PenLine, Trash2} from "lucide-react";
import {Platform, PlatformConfig, SuggestedTopic} from "@/app/types/types";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const API_PLATFORM_TO_UI = {
    BLOG: Platform.BLOG,
    LINKEDIN: Platform.LINKEDIN,
    TWITTER: Platform.TWITTER,
    INSTAGRAM: Platform.INSTAGRAM,
} as const;

export default function IdeeDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params.id;
    const [suggestedTopic, setSuggestedTopic] = useState<SuggestedTopic | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundError, setNotFoundError] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    useEffect(() => {
        const fetchSuggestedTopic = async () => {
            try {
                const res = await fetch(`${API_URL}/suggested-topic/${id}`, {
                    cache: "no-store",
                    credentials: "include",
                });

                if (!res.ok) {
                    setNotFoundError(true);
                    return;
                }

                const data: SuggestedTopic = await res.json();
                setSuggestedTopic(data);
            } catch {
                setNotFoundError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestedTopic();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-lg text-accent"/>
            </div>
        );
    }

    if (notFoundError || !suggestedTopic) {
        notFound();
    }

    const uiPlatform = API_PLATFORM_TO_UI[suggestedTopic.recommendedPlatform];
    const config = PlatformConfig[uiPlatform];

    const handleEdit = () => {
        router.push(`/content/writing?idea=${suggestedTopic.id}`);
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Supprimer cette idée ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Supprimer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#DC2626",
        });

        if (!result.isConfirmed) return;

        try {
            setDeleting(true);

            const res = await fetch(`${API_URL}/suggested-topic/${suggestedTopic.id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error();
            }

            await Toast.fire({icon: "success", title: "Idée supprimée avec succès"});
            router.push("/content/suggested-topics");
        } catch {
            setDeleting(false);
            await Toast.fire({icon: "error", title: "Une erreur est survenue, veuillez réessayer"});
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-full h-full">
            <div className="flex items-center gap-2">
                <Link href="/content/suggested-topics"
                    className="flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors"
                >
                    <ArrowLeft size={14}/>
                    Génération d&apos;idées
                </Link>
                <span className="text-base-content/30 text-sm">›</span>
                <span className="text-sm text-base-content/40 line-clamp-1">{suggestedTopic.topic}</span>
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
                                <span className="text-xs text-base-content/40">{new Date(suggestedTopic.createdAt).toLocaleDateString("fr-FR")}</span>
                            </div>

                            <h1 className="text-xl font-bold font-display leading-snug">
                                {suggestedTopic.topic}
                            </h1>

                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {suggestedTopic.topicDescription}
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
                                disabled={deleting}
                                className="btn btn-primary btn-sm w-full gap-2 rounded-full"
                            >
                                <PenLine size={14}/>
                                Rédiger ce contenu
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="btn btn-outline btn-error btn-sm w-full gap-2 rounded-full"
                            >
                                {deleting ? <span className="loading loading-spinner loading-xs"/> : <Trash2 size={14}/>} 
                                {deleting ? "Suppression..." : "Supprimer l'idée"}
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

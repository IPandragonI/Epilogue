"use client";

import {Suspense, useEffect, useState} from "react";
import {CheckCircle2, Sparkles, ArrowRight} from "lucide-react";
import {Platform, PlatformConfig, PlatformType, SuggestedTopic} from "@/app/types/types";
import Preview from "@/app/components/content/writing/Preview";
import TextEditor from "@/app/components/content/writing/TextEditor";
import Swal from "sweetalert2";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import CurationPicker from "@/app/components/content/writing/CurationPicker";
import {User, AgencySubscription} from "@/app/types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const API_PLATFORM_TO_UI: Record<SuggestedTopic["recommendedPlatform"], PlatformType> = {
    BLOG: Platform.BLOG,
    LINKEDIN: Platform.LINKEDIN,
    TWITTER: Platform.TWITTER,
    INSTAGRAM: Platform.INSTAGRAM,
};

export default function WritingPage() {
    return (
        <Suspense fallback={null}>
            <WritingPageContent />
        </Suspense>
    );
}

function WritingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ideaId = searchParams.get("idea");

    const [platform, setPlatform] = useState<PlatformType>(Platform.LINKEDIN);
    const [content, setContent] = useState("");
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState("professionnel");
    const [length, setLength] = useState("moyen");
    const [generating, setGenerating] = useState(false);
    const [genCount, setGenCount] = useState(0);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [selectedIdea, setSelectedIdea] = useState<SuggestedTopic | null>(null);
    const [loadingIdea, setLoadingIdea] = useState(false);
    const [ideaError, setIdeaError] = useState<string | null>(null);

    const [curationItemIds, setCurationItemIds] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<AgencySubscription | null>(null);

    const currentPlatform = PlatformConfig[platform];
    const isEmpty = !content || content.replace(/<[^>]*>/g, "").trim().length === 0;
    const isOverLimit = charCount > currentPlatform.maxLength;

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    useEffect(() => {
        if (!ideaId) {
            setSelectedIdea(null);
            setIdeaError(null);
            return;
        }

        const fetchIdea = async () => {
            try {
                setLoadingIdea(true);
                setIdeaError(null);

                const res = await fetch(`${API_URL}/suggested-topic/${ideaId}`, {
                    cache: "no-store",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error();
                }

                const idea: SuggestedTopic = await res.json();

                setSelectedIdea(idea);
                setPlatform(API_PLATFORM_TO_UI[idea.recommendedPlatform]);
                setPrompt(`${idea.topic}\n\n${idea.topicDescription}`);
                setTitle(idea.topic);
            } catch {
                setSelectedIdea(null);
                setIdeaError("Impossible de charger l'idée sélectionnée.");
            } finally {
                setLoadingIdea(false);
            }
        };

        fetchIdea();
    }, [ideaId]);

    const fetchAccountData = async () => {
        try {
            const userRes = await fetch(`${API_URL}/auth/me`, {
                credentials: "include",
                cache: "no-store",
            });

            if (!userRes.ok) return;

            const user = await userRes.json();
            setCurrentUser(user);

            const agencyId = user.agency?.id;

            if (!agencyId) return;

            const subRes = await fetch(`${API_URL}/agency-subscriptions/agency/${agencyId}`, {
                credentials: "include",
                cache: "no-store",
            });

            if (subRes.ok) {
                setSubscription(await subRes.json());
            }
        } catch {
            // silencieux : le picker se désactive juste si aucune donnée
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        try {
            setGenerating(true);
            setContent("");

            const res = await fetch(`${API_URL}/ai/generate-post`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({platform, subject: prompt, tone, length, curationItemIds}),
            });

            if (!res.ok) {
                if (res.status === 403) {
                    const err = await res.json().catch(() => null);
                    await Toast.fire({icon: "warning", title: err?.message ?? "Quota atteint"});
                    return;
                }
                throw new Error();
            }

            const data: {title: string; content: string; tags: string[]} = await res.json();

            setTitle(data.title);

            const html = [
                `<h1>${data.title}</h1>`,
                data.content.replace(/\n/g, ""),
                platform !== Platform.TWITTER
                    ? `<p>${data.tags.map(t => `#${t.replace(/\s+/g, "")}`).join(" ")}</p>`
                    : null,
            ].filter(Boolean).join("");

            setContent(html);
            setGenCount(c => c + 1);

            await Toast.fire({icon: "success", title: "Contenu généré avec succès"});
        } catch {
            await Toast.fire({icon: "error", title: "Une erreur est survenue, veuillez réessayer"});
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (isEmpty) return;
        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/content`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    title: title || "Sans titre",
                    body: content,
                    contentPlatform: platform,
                }),
            });

            if (!res.ok) {
                throw new Error();
            }

            const saved: {id: string} = await res.json();
            await Toast.fire({icon: "success", title: "Post enregistré avec succès"});
            router.push(`/content/posts/${saved.id}`);
        } catch {
            await Toast.fire({icon: "error", title: "Une erreur est survenue, veuillez réessayer"});
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex gap-5 h-full max-h-[calc(100vh-4rem)]">
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto pr-1">
                <div>
                    <h1 className="text-2xl font-bold font-display">Rédaction de contenus</h1>
                    <p className="text-sm text-base-content/50 mt-1">
                        Transformez vos articles SEO en contenu viral pour chaque platform.
                    </p>
                </div>

                { /*selectedIdea && (
                    <div className="alert alert-info bg-base-100 border border-base-300 text-sm">
                        <span>
                            Idée chargée : <strong>{selectedIdea.topic}</strong>
                        </span>
                        <Link href={`/content/suggested-topics/${selectedIdea.id}`} className="link link-hover ml-auto">
                            Voir l&apos;idée
                        </Link>
                    </div>
                ) Barre suplémentaire de chargement pour feeback utilisateur : non fonctionnelle pour le moment */}

                {ideaError && (
                    <div className="alert alert-error text-sm">
                        <span>{ideaError}</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    {(Object.entries(PlatformConfig) as [PlatformType, (typeof PlatformConfig)[PlatformType]][]).map(
                        ([platformKey, config]) => (
                            <button
                                key={platformKey}
                                onClick={() => setPlatform(platformKey)}
                                className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:cursor-pointer min-w-56 ${
                                    platform === platformKey
                                        ? "border-accent bg-base-100 shadow-sm"
                                        : "border-base-300 bg-base-100 hover:border-accent/30"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                        platform === platformKey ? "bg-accent text-base-100" : "bg-base-200 text-accent/50"
                                    }`}>
                                        {config.icon}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold leading-tight ${platform === platformKey ? "" : "text-accent/60"}`}>
                                            {config.label}
                                        </p>
                                        <p className="text-xs text-accent/40">{config.subLabel}</p>
                                    </div>
                                </div>
                                {platform === platformKey && (
                                    <CheckCircle2 size={16} className="ml-1 text-accent shrink-0"/>
                                )}
                            </button>
                        ))}
                </div>

                <div className="card bg-base-100 border border-base-300 shadow-xs flex-1 flex flex-col min-h-72 relative">
                    <TextEditor
                        content={content}
                        onChange={setContent}
                        maxChars={currentPlatform.maxLength}
                        onCharsChange={setCharCount}
                        placeholder="Commencez à taper..."
                    />
                    {generating && (
                        <div className="absolute inset-0 bg-base-100/70 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <span className="loading loading-spinner loading-md text-accent"/>
                                <p className="text-sm text-base-content/60">Génération du post...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-96 shrink-0 flex flex-col gap-4 overflow-y-auto">
                <div className="card bg-base-100 border border-base-300 shadow-xs">
                    <div className="card-body p-5 gap-4">
                        <h2 className="font-bold text-sm">Paramétrage</h2>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-base-content/50 font-medium">Sujet / instructions</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ex : un post sur le SEO en 2026 avec un ton expert..."
                                rows={4}
                                className="textarea textarea-bordered textarea-sm text-sm leading-relaxed resize-none w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-base-content/50 font-medium">Ton</label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="select select-bordered select-sm text-sm w-full"
                            >
                                <option value="professionnel">Professionnel</option>
                                <option value="decontracte">Décontracté</option>
                                <option value="inspirant">Inspirant</option>
                                <option value="educatif">Éducatif</option>
                                <option value="humoristique">Humoristique</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-base-content/50 font-medium">Longueur</label>
                            <div className="join w-full">
                                {(["court", "moyen", "long"] as const).map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLength(l)}
                                        className={`join-item btn btn-xs flex-1 capitalize ${length === l ? "btn-neutral" : "btn-ghost border border-base-300"}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || loadingIdea || !prompt.trim()}
                            className="btn btn-outline btn-sm w-full gap-2 rounded-lg"
                        >
                            {generating || loadingIdea ? <span className="loading loading-spinner loading-xs"/> : <Sparkles size={13}/>} 
                            {loadingIdea ? "Chargement..." : generating ? "Génération..." : "Générer"}
                        </button>

                        <CurationPicker
                            selectedIds={curationItemIds}
                            onChange={setCurationItemIds}
                            subscription={subscription}
                            curationUsedThisMonth={currentUser?.nbCurationUsedThisMonth ?? 0}
                            onRefreshQuota={fetchAccountData}
                        />
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-300 shadow-xs">
                    <div className="card-body p-5 gap-3">
                        <h2 className="font-bold text-sm">Aperçu direct</h2>
                        <Preview key={genCount} platform={platform} content={content}/>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isEmpty || saving || isOverLimit}
                    className="btn btn-accent gap-2 rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <span className="loading loading-spinner loading-xs"/> : <ArrowRight size={15}/>}
                    {saving ? "Enregistrement..." : "Ajouter votre post"}
                </button>
                {isOverLimit && (
                    <p className="text-xs text-error text-center">
                        Le contenu dépasse la limite de {currentPlatform.maxLength.toLocaleString("fr-FR")} caractères pour {currentPlatform.label}.
                    </p>
                )}
            </div>
        </div>
    );
}

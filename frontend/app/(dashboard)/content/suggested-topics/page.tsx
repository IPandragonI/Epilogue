"use client";

import {useCallback, useEffect, useState} from "react";
import {Lightbulb, Newspaper, Plus, Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {CurationItems, SuggestedTopic, AgencySubscription} from "@/app/types/types";
import SuggestedTopicCard from "@/app/components/content/SuggestedTopicCard";
import {useAuth} from "@/app/hooks/useAuth";
import CurationSelectionModal from "@/app/components/content/CurationSelectionModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function IdeasPage() {
    const router = useRouter();
    const {user, loading: loadingUser, setUser} = useAuth();
    const [prompt, setPrompt] = useState("");
    const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
    const [curationItems, setCurationItems] = useState<CurationItems[]>([]);
    const [selectedCurationIds, setSelectedCurationIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingCurations, setLoadingCurations] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generated, setGenerated] = useState(false);
    const [generatedTopicIds, setGeneratedTopicIds] = useState<string[]>([]);
    const [generatedCount, setGeneratedCount] = useState(0);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [subscription, setSubscription] = useState<AgencySubscription | null>(null);
    const [refreshingQuota, setRefreshingQuota] = useState(false);

    const maxCuration = subscription?.subscriptionPlan?.maxCurationPerMonth || 0;
    const remainingQuota = Math.max(maxCuration - (user?.nbCurationUsedThisMonth ?? 0), 0);
    const maxSelectable = Math.min(remainingQuota, maxCuration);

    useEffect(() => {
        const fetchSuggestedTopics = async () => {
            try {
                setLoadingInitial(true);
                setError(null);

                const res = await fetch(`${API_URL}/suggested-topic`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    const errorText = await readErrorMessage(res);
                    setError(errorText || "Erreur lors du chargement des idees");
                    setSuggestedTopics([]);
                    return;
                }

                const data: SuggestedTopic[] = await res.json();
                setSuggestedTopics(data);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Impossible de charger les idees");
            } finally {
                setLoadingInitial(false);
            }
        };

        fetchSuggestedTopics();
    }, []);

    useEffect(() => {
        if (loadingUser) {
            return;
        }

        if (!user?.id) {
            setCurationItems([]);
            setSelectedCurationIds([]);
            setLoadingCurations(false);
            return;
        }

        const fetchCurations = async () => {
            try {
                setLoadingCurations(true);

                const res = await fetch(`${API_URL}/users/${user.id}/curation-items`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    setCurationItems([]);
                    return;
                }

                const data: CurationItems[] = await res.json();
                setCurationItems(Array.isArray(data) ? data : []);
            } catch {
                setCurationItems([]);
            } finally {
                setLoadingCurations(false);
            }
        };

        fetchCurations();
    }, [loadingUser, user?.id]);

    const fetchSubscription = useCallback(async () => {
        if (!user?.agency?.id) return;

        try {
            const res = await fetch(`${API_URL}/agency-subscriptions/agency/${user.agency.id}`, {
                credentials: "include",
                cache: "no-store",
            });

            if (res.ok) {
                setSubscription(await res.json());
            }
        } catch {
            // silencieux : la sélection se limite juste à 0 ressource si indisponible
        }
    }, [user?.agency?.id]);

    useEffect(() => {
        if (loadingUser || !user?.agency?.id) {
            return;
        }

        fetchSubscription();
    }, [loadingUser, user?.agency?.id, fetchSubscription]);

    const handleOpenSelectionModal = async () => {
        setRefreshingQuota(true);
        try {
            await fetchSubscription();
        } finally {
            setRefreshingQuota(false);
            setIsSelectionModalOpen(true);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setGenerated(false);
            setGeneratedTopicIds([]);
            setGeneratedCount(0);

            const res = await fetch(`${API_URL}/suggested-topic/generate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    terms: prompt.trim(),
                    curationItemIds: selectedCurationIds,
                }),
            });

            if (!res.ok) {
                throw new Error(await readErrorMessage(res));
            }

            const data: { topics: SuggestedTopic[]; nbCurationUsedThisMonth: number } = await res.json();
            const createdTopics = data.topics;
            const createdTopicIds = new Set(createdTopics.map((topic) => topic.id));

            setSuggestedTopics((currentTopics) => [
                ...createdTopics,
                ...currentTopics.filter((topic) => !createdTopicIds.has(topic.id)),
            ]);
            setGeneratedTopicIds(createdTopics.map((topic) => topic.id));
            setGeneratedCount(createdTopics.length);
            setGenerated(true);

            setUser((prevUser: any) => prevUser ? {
                ...prevUser,
                nbCurationUsedThisMonth: data.nbCurationUsedThisMonth,
            } : prevUser);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Impossible de generer des idees");
        } finally {
            setLoading(false);
        }
    };

    const handleDetail = (suggestedTopic: SuggestedTopic) => {
        router.push(`/content/suggested-topics/${suggestedTopic.id}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleGenerate();
    };

    const removeCurationId = (id: string) => {
        setSelectedCurationIds((current) => current.filter((currentId) => currentId !== id));
    };

    const selectedCurationItems = curationItems.filter((item) => selectedCurationIds.includes(item.id));

    return (
        <div className="flex flex-col gap-6 max-w-full">
            <h1 className="text-2xl font-bold font-display">Génération d&apos;idées</h1>

            <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl">
                <div className="card-body p-5 gap-0">
                    {/* Rangée sujet */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <label className="input input-bordered rounded-xl flex items-center gap-2 flex-1 h-12">
                            <Lightbulb size={16} className="text-base-content/40 shrink-0"/>
                            <input
                                type="text"
                                placeholder="Ex : SEO local, restaurants, Google Business Profile"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="grow text-sm sm:text-base"
                            />
                        </label>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || loadingCurations || !prompt.trim()}
                            className="btn btn-neutral h-12 px-6 rounded-xl gap-2"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"/>
                            ) : (
                                <Sparkles size={15}/>
                            )}
                            {loading ? "Génération..." : "Générer"}
                        </button>
                    </div>

                    {/* Rangée ressources */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-base-300">
                        <span className="text-xs font-medium uppercase tracking-wide text-base-content/40 shrink-0">
                            Ressources
                        </span>

                        {loadingCurations ? (
                            <span className="text-xs text-base-content/40 flex items-center gap-1.5">
                                <span className="loading loading-spinner loading-xs"/>
                                Chargement...
                            </span>
                        ) : maxCuration === 0 ? (
                            <span className="text-xs text-base-content/40">
                                Curation non incluse dans votre abonnement
                            </span>
                        ) : (
                            <>
                                {selectedCurationItems.map((item) => (
                                    <span
                                        key={item.id}
                                        className="badge badge-lg gap-1.5 bg-base-200 border-base-300 text-base-content/70 font-normal pr-1.5"
                                    >
                                        <Newspaper size={11} className="text-base-content/40 shrink-0"/>
                                        <span className="max-w-40 truncate">{item.title}</span>
                                        <button
                                            onClick={() => removeCurationId(item.id)}
                                            className="text-base-content/30 hover:text-base-content/70 leading-none ml-0.5"
                                            aria-label={`Retirer ${item.title}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}

                                <button
                                    onClick={handleOpenSelectionModal}
                                    disabled={refreshingQuota}
                                    className="badge badge-lg badge-outline border-dashed gap-1.5 font-normal hover:bg-base-200 hover:border-base-content/30 transition-colors cursor-pointer"
                                >
                                    {refreshingQuota ? (
                                        <span className="loading loading-spinner loading-xs"/>
                                    ) : (
                                        <Plus size={12}/>
                                    )}
                                    {selectedCurationIds.length ? "Modifier" : "Ajouter des ressources"}
                                </button>

                                <span className="text-xs text-base-content/40 ml-auto shrink-0">
                                    {remainingQuota} restante{remainingQuota > 1 ? "s" : ""} / {maxCuration} ce mois-ci
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {generated && (
                <div className="flex items-center gap-2 text-sm text-base-content/50">
                    <Sparkles size={13} className="text-primary"/>
                    <span>{generatedCount} idée{generatedCount > 1 ? "s" : ""} générée{generatedCount > 1 ? "s" : ""} pour &quot;{prompt}&quot;</span>
                    <button
                        onClick={() => {
                            setGenerated(false);
                            setGeneratedTopicIds([]);
                            setGeneratedCount(0);
                            setPrompt("");
                        }}
                        className="btn btn-ghost btn-xs ml-auto"
                    >
                        Réinitialiser
                    </button>
                </div>
            )}

            {error && (
                <div className="alert alert-error text-sm">
                    <span>{error}</span>
                </div>
            )}

            {loadingInitial && (
                <div className="flex items-center gap-2 text-sm text-base-content/50">
                    <span className="loading loading-spinner loading-sm"/>
                    <span>Chargement des idées...</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedTopics.map((suggestedTopic) => (
                    <SuggestedTopicCard
                        key={suggestedTopic.id}
                        suggestedTopic={suggestedTopic}
                        isNew={generatedTopicIds.includes(suggestedTopic.id)}
                        onDetailClick={handleDetail}
                    />
                ))}
            </div>

            {!loadingInitial && !suggestedTopics.length && !error && (
                <p className="text-sm text-base-content/50">Aucune idée disponible pour le moment.</p>
            )}

            {isSelectionModalOpen && (
                <CurationSelectionModal
                    items={curationItems}
                    selectedIds={selectedCurationIds}
                    maxSelectable={maxSelectable}
                    quotaLabel={`${remainingQuota} restant${remainingQuota > 1 ? "s" : ""} ce mois-ci sur ${maxCuration}`}
                    onClose={() => setIsSelectionModalOpen(false)}
                    onApply={(ids) => { setSelectedCurationIds(ids); setIsSelectionModalOpen(false); }}
                />
            )}

        </div>
    );
}

async function readErrorMessage(response: Response): Promise<string> {
    const text = await response.text();

    try {
        const data = JSON.parse(text);

        if (typeof data?.message === "string") {
            return data.message;
        }

        if (Array.isArray(data?.message)) {
            return data.message.join(", ");
        }
    } catch {
        return text;
    }

    return "Une erreur est survenue.";
}
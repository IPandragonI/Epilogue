"use client";

import {useEffect, useState} from "react";
import {Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {CurationItems, SuggestedTopic} from "@/app/types/types";
import SuggestedTopicCard from "@/app/components/content/SuggestedTopicCard";
import {useAuth} from "@/app/hooks/useAuth";
import CurationSelectionModal from "@/app/components/content/CurationSelectionModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function IdeasPage() {
    const router = useRouter();
    const {user, loading: loadingUser} = useAuth();
    const [prompt, setPrompt] = useState("");
    const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
    const [curationItems, setCurationItems] = useState<CurationItems[]>([]);
    const [selectedCurationIds, setSelectedCurationIds] = useState<string[]>([]);
    const [selectionInitialized, setSelectionInitialized] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingCurations, setLoadingCurations] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generated, setGenerated] = useState(false);
    const [generatedTopicIds, setGeneratedTopicIds] = useState<string[]>([]);
    const [generatedCount, setGeneratedCount] = useState(0);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

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
                const items = Array.isArray(data) ? data : [];

                setCurationItems(items);

                if (!selectionInitialized) {
                    setSelectedCurationIds(items.slice(0, 3).map((item) => item.id));
                    setSelectionInitialized(true);
                }
            } catch {
                setCurationItems([]);
            } finally {
                setLoadingCurations(false);
            }
        };

        fetchCurations();
    }, [loadingUser, selectionInitialized, user?.id]);

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

            const createdTopics: SuggestedTopic[] = await res.json();
            const createdTopicIds = new Set(createdTopics.map((topic) => topic.id));

            setSuggestedTopics((currentTopics) => [
                ...createdTopics,
                ...currentTopics.filter((topic) => !createdTopicIds.has(topic.id)),
            ]);
            setGeneratedTopicIds(createdTopics.map((topic) => topic.id));
            setGeneratedCount(createdTopics.length);
            setGenerated(true);
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

    const selectedCurationItems = curationItems.filter((item) => selectedCurationIds.includes(item.id));
    const selectedCurationSummary = selectedCurationItems.slice(0, 2).map((item) => item.title).join(" • ");

    return (
        <div className="flex flex-col gap-6 max-w-full">
            <h1 className="text-2xl font-bold font-display">Génération d&apos;idées</h1>
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="rounded-xl border border-base-300 bg-base-100 px-4 py-3 lg:w-80 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-base-content/40">
                                Ressources utilisées
                            </p>
                            <p className="text-lg font-semibold mt-1">
                                {loadingCurations ? "..." : selectedCurationIds.length}
                            </p>
                            <p className="text-xs text-base-content/50 mt-1 line-clamp-2">
                                {loadingCurations
                                    ? "Chargement des ressources..."
                                    : selectedCurationSummary || "Aucune ressource sélectionnée."}
                            </p>
                        </div>

                        <button
                            onClick={() => setIsSelectionModalOpen(true)}
                            disabled={loadingCurations}
                            className="btn btn-ghost btn-sm rounded-lg shrink-0"
                        >
                            Modifier
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    <input
                        type="text"
                        placeholder="Ex : SEO local, restaurants, Google Business Profile"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input input-bordered flex-1 text-sm rounded-xl"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading || loadingCurations || !prompt.trim()}
                        className="btn btn-neutral px-6 rounded-xl gap-2"
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"/>
                        ) : (
                            <Sparkles size={15}/>
                        )}
                        {loading ? "Génération..." : "Générer"}
                    </button>
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
                    onClose={() => setIsSelectionModalOpen(false)}
                    onApply={(ids) => {
                        setSelectedCurationIds(ids);
                        setIsSelectionModalOpen(false);
                    }}
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

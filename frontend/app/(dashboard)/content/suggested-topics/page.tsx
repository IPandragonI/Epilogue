"use client";

import {useEffect, useState} from "react";
import {Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {SuggestedTopic} from "@/app/types/types";
import SuggestedTopicCard from "@/app/components/content/SuggestedTopicCard";

export default function IdeasPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [allSuggestedTopics, setAllSuggestedTopics] = useState<SuggestedTopic[]>([]);
    const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generated, setGenerated] = useState(false);

    useEffect(() => {
        const fetchSuggestedTopics = async () => {
            try {
                setLoadingInitial(true);
                setError(null);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suggested-topic`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    setError(errorText || "Erreur lors du chargement des idees");
                    setAllSuggestedTopics([]);
                    setSuggestedTopics([]);
                    return;
                }

                const data: SuggestedTopic[] = await res.json();
                setAllSuggestedTopics(data);
                setSuggestedTopics(data);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Impossible de charger les idees");
            } finally {
                setLoadingInitial(false);
            }
        };

        fetchSuggestedTopics();
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setGenerated(false);

        await new Promise((r) => setTimeout(r, 250));

        const needle = prompt.trim().toLowerCase();
        const filtered = allSuggestedTopics.filter((suggestedTopic) =>
            `${suggestedTopic.topic} ${suggestedTopic.topicDescription}`.toLowerCase().includes(needle),
        );

        setSuggestedTopics(filtered);
        setGenerated(true);
        setLoading(false);
    };

    const handleDetail = (suggestedTopic: SuggestedTopic) => {
        router.push(`/content/ideas/${suggestedTopic.id}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleGenerate();
    };

    return (
        <div className="flex flex-col gap-6 max-w-full">
            <h1 className="text-2xl font-bold font-display">Génération d&apos;idées</h1>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Trouver une idée"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input input-bordered flex-1 text-sm rounded-xl"
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
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

            {generated && (
                <div className="flex items-center gap-2 text-sm text-base-content/50">
                    <Sparkles size={13} className="text-primary"/>
                    <span>{suggestedTopics.length} idées générées pour &quot;{prompt}&quot;</span>
                    <button
                        onClick={() => {
                            setSuggestedTopics(allSuggestedTopics);
                            setGenerated(false);
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
                        isNew={generated}
                        onDetailClick={handleDetail}
                    />
                ))}
            </div>

            {!loadingInitial && !suggestedTopics.length && !error && (
                <p className="text-sm text-base-content/50">Aucune idée trouvée pour cette recherche.</p>
            )}

        </div>
    );
}
"use client";

import {useState} from "react";
import {Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {ContentIdea, Platform} from "@/app/types/types";
import IdeaCard from "@/app/components/content/IdeaCard";

const IDEES_INITIALES: ContentIdea[] = [
    {
        id: 1,
        title: "Le SEO en 2026 : Ce qui fonctionne vraiment",
        createdAt: "11 Jan 2022",
        platform: Platform.BLOG,
        description: "Le référencement évolue rapidement. Découvrez les stratégies SEO réellement efficaces en 2026 pour améliorer votre visibilité, attirer du trafic qualifié et rester compétitif.",
    },
    {
        id: 2,
        title: "Les erreurs SEO qui ruinent votre site",
        createdAt: "11 Jan 2022",
        platform: Platform.INSTAGRAM,
        description: "Beaucoup de sites perdent du trafic à cause d'erreurs SEO évitables. Cet article révèle les pièges courants et comment les corriger pour améliorer votre classement.",
    },
    {
        id: 3,
        title: "SEO pour débutants : Le guide essentiel",
        createdAt: "11 Jan 2022",
        platform: Platform.BLOG,
        description: "Apprenez les bases du référencement naturel : mots-clés, optimisation technique, contenu et liens. Un guide simple pour comprendre le SEO et améliorer votre site.",
    },
    {
        id: 4,
        title: "Comment trouver les bons mots-clés pour votre SEO",
        createdAt: "11 Jan 2022",
        platform: Platform.INSTAGRAM,
        description: "Trouver les bons mots-clés est crucial pour le SEO. Découvrez des méthodes simples et des outils efficaces pour cibler les recherches qui apportent vraiment du trafic.",
    },
    {
        id: 5,
        title: "SEO et contenu : la stratégie gagnante pour 2026",
        createdAt: "11 Jan 2022",
        platform: Platform.BLOG,
        description: "Le contenu reste au cœur du SEO. Apprenez comment créer des articles optimisés, utiles et engageants qui plaisent aux lecteurs et aux moteurs de recherche.",
    },
    {
        id: 6,
        title: "SEO technique : Les bases à maîtriser",
        createdAt: "11 Jan 2022",
        platform: Platform.LINKEDIN,
        description: "Vitesse, structure, indexation, balises. Cet article explique les éléments techniques essentiels du SEO pour rendre votre site plus performant et visible sur Google.",
    },
];

const IDEES_GENEREES: ContentIdea[] = [
    {
        id: 101,
        title: "Comment l'IA transforme le SEO en 2026",
        createdAt: "Aujourd'hui",
        platform: Platform.BLOG,
        description: "L'intelligence artificielle redéfinit les règles du référencement. Explorez comment Google SGE et les LLMs changent la façon dont les contenus sont indexés et découverts.",
    },
    {
        id: 102,
        title: "5 astuces pour booster son score SEO",
        createdAt: "Aujourd'hui",
        platform: Platform.LINKEDIN,
        description: "Des conseils concrets et actionnables pour améliorer rapidement votre positionnement sur Google et attirer un trafic plus qualifié vers votre site.",
    },
    {
        id: 103,
        title: "Pourquoi votre blog stagne (et comment y remédier)",
        createdAt: "Aujourd'hui",
        platform: Platform.INSTAGRAM,
        description: "Manque de régularité, contenu générique, mauvais mots-clés… Identifiez les raisons qui bloquent la croissance de votre blog et les solutions pour en sortir.",
    },
    {
        id: 104,
        title: "Rédiger pour les humains ET pour Google",
        createdAt: "Aujourd'hui",
        platform: Platform.BLOG,
        description: "Le meilleur contenu SEO n'est pas celui qui triche avec les algorithmes, mais celui qui répond vraiment aux questions des utilisateurs. Voici comment trouver l'équilibre.",
    },
    {
        id: 105,
        title: "Calendrier éditorial SEO : le guide complet",
        createdAt: "Aujourd'hui",
        platform: Platform.LINKEDIN,
        description: "Planifier son contenu à l'avance est la clé d'une stratégie SEO cohérente. Découvrez comment structurer votre calendrier pour maximiser votre impact organique.",
    },
    {
        id: 106,
        title: "Les outils IA indispensables pour créer du contenu",
        createdAt: "Aujourd'hui",
        platform: Platform.INSTAGRAM,
        description: "ChatGPT, Perplexity, Jasper… Tour d'horizon des meilleurs outils IA pour accélérer la création de contenu SEO sans sacrifier la qualité.",
    },
];

export default function IdeasPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [ideas, setIdeas] = useState<ContentIdea[]>(IDEES_INITIALES);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setGenerated(false);

        await new Promise((r) => setTimeout(r, 1400));

        setIdeas(IDEES_GENEREES);
        setGenerated(true);
        setLoading(false);
    };

    const handleDetail = (idee: ContentIdea) => {
        router.push(`/content/ideas/${idee.id}`);
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
                    <span>{ideas.length} idées générées pour &quot;{prompt}&quot;</span>
                    <button
                        onClick={() => {
                            setIdeas(IDEES_INITIALES);
                            setGenerated(false);
                            setPrompt("");
                        }}
                        className="btn btn-ghost btn-xs ml-auto"
                    >
                        Réinitialiser
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idee) => (
                    <IdeaCard key={idee.id} idee={idee} isNew={generated} onDetailClick={handleDetail}/>
                ))}
            </div>

        </div>
    );
}
"use client";

import {useState} from "react";
import {Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";

type Plateforme = "LinkedIn post" | "Instagram post" | "Blog website";

type Idee = {
    id: number;
    titre: string;
    date: string;
    plateforme: Plateforme;
    description: string;
};

const PLATEFORME_STYLES: Record<Plateforme, string> = {
    "LinkedIn post": "bg-blue-100 text-blue-700",
    "Instagram post": "bg-purple-100 text-purple-700",
    "Blog website": "bg-yellow-100 text-yellow-700",
};

function PlatformeBadge({plateforme}: { plateforme: Plateforme }) {
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${PLATEFORME_STYLES[plateforme]}`}>
      {plateforme}
    </span>
    );
}


const IDEES_INITIALES: Idee[] = [
    {
        id: 1,
        titre: "Le SEO en 2026 : Ce qui fonctionne vraiment",
        date: "11 Jan 2022",
        plateforme: "LinkedIn post",
        description: "Le référencement évolue rapidement. Découvrez les stratégies SEO réellement efficaces en 2026 pour améliorer votre visibilité, attirer du trafic qualifié et rester compétitif.",
    },
    {
        id: 2,
        titre: "Les erreurs SEO qui ruinent votre site",
        date: "11 Jan 2022",
        plateforme: "Instagram post",
        description: "Beaucoup de sites perdent du trafic à cause d'erreurs SEO évitables. Cet article révèle les pièges courants et comment les corriger pour améliorer votre classement.",
    },
    {
        id: 3,
        titre: "SEO pour débutants : Le guide essentiel",
        date: "11 Jan 2022",
        plateforme: "Blog website",
        description: "Apprenez les bases du référencement naturel : mots-clés, optimisation technique, contenu et liens. Un guide simple pour comprendre le SEO et améliorer votre site.",
    },
    {
        id: 4,
        titre: "Comment trouver les bons mots-clés pour votre SEO",
        date: "11 Jan 2022",
        plateforme: "Instagram post",
        description: "Trouver les bons mots-clés est crucial pour le SEO. Découvrez des méthodes simples et des outils efficaces pour cibler les recherches qui apportent vraiment du trafic.",
    },
    {
        id: 5,
        titre: "SEO et contenu : la stratégie gagnante pour 2026",
        date: "11 Jan 2022",
        plateforme: "Blog website",
        description: "Le contenu reste au cœur du SEO. Apprenez comment créer des articles optimisés, utiles et engageants qui plaisent aux lecteurs et aux moteurs de recherche.",
    },
    {
        id: 6,
        titre: "SEO technique : Les bases à maîtriser",
        date: "11 Jan 2022",
        plateforme: "LinkedIn post",
        description: "Vitesse, structure, indexation, balises. Cet article explique les éléments techniques essentiels du SEO pour rendre votre site plus performant et visible sur Google.",
    },
];

const IDEES_GENEREES: Idee[] = [
    {
        id: 101,
        titre: "Comment l'IA transforme le SEO en 2026",
        date: "Aujourd'hui",
        plateforme: "Blog website",
        description: "L'intelligence artificielle redéfinit les règles du référencement. Explorez comment Google SGE et les LLMs changent la façon dont les contenus sont indexés et découverts.",
    },
    {
        id: 102,
        titre: "5 astuces pour booster son score SEO",
        date: "Aujourd'hui",
        plateforme: "LinkedIn post",
        description: "Des conseils concrets et actionnables pour améliorer rapidement votre positionnement sur Google et attirer un trafic plus qualifié vers votre site.",
    },
    {
        id: 103,
        titre: "Pourquoi votre blog stagne (et comment y remédier)",
        date: "Aujourd'hui",
        plateforme: "Instagram post",
        description: "Manque de régularité, contenu générique, mauvais mots-clés… Identifiez les raisons qui bloquent la croissance de votre blog et les solutions pour en sortir.",
    },
    {
        id: 104,
        titre: "Rédiger pour les humains ET pour Google",
        date: "Aujourd'hui",
        plateforme: "Blog website",
        description: "Le meilleur contenu SEO n'est pas celui qui triche avec les algorithmes, mais celui qui répond vraiment aux questions des utilisateurs. Voici comment trouver l'équilibre.",
    },
    {
        id: 105,
        titre: "Calendrier éditorial SEO : le guide complet",
        date: "Aujourd'hui",
        plateforme: "LinkedIn post",
        description: "Planifier son contenu à l'avance est la clé d'une stratégie SEO cohérente. Découvrez comment structurer votre calendrier pour maximiser votre impact organique.",
    },
    {
        id: 106,
        titre: "Les outils IA indispensables pour créer du contenu",
        date: "Aujourd'hui",
        plateforme: "Instagram post",
        description: "ChatGPT, Perplexity, Jasper… Tour d'horizon des meilleurs outils IA pour accélérer la création de contenu SEO sans sacrifier la qualité.",
    },
];

function IdeeCard({idee, isNew, onDetailClick}: { idee: Idee; isNew?: boolean; onDetailClick: (idee: Idee) => void }) {
    return (
        <div className={`card bg-base-100 border shadow-xs flex flex-col transition-all duration-300 ${isNew ? "border-primary/30 ring-1 ring-primary/20" : "border-base-300"}`}>
            <div className="card-body p-5 gap-3 flex-1">
                <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2">{idee.titre}</h3>
                    <div className="flex items-center gap-2 text-xs text-base-content/40">
                        <span>{idee.date}</span>
                        <span>•</span>
                        <PlatformeBadge plateforme={idee.plateforme}/>
                    </div>
                </div>

                <p className="text-sm text-base-content/60 leading-relaxed line-clamp-4 flex-1">
                    {idee.description}
                </p>

                <button onClick={() => onDetailClick(idee)}
                    className="btn btn-outline btn-sm rounded-full w-full mt-1">
                    Voir les détails
                </button>
            </div>
        </div>
    );
}


export default function IdeesPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [idees, setIdees] = useState<Idee[]>(IDEES_INITIALES);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerer = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setGenerated(false);

        await new Promise((r) => setTimeout(r, 1400));

        setIdees(IDEES_GENEREES);
        setGenerated(true);
        setLoading(false);
    };

    const handleDetail = (idee: Idee) => {
        router.push(`/content/idees/${idee.id}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleGenerer();
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
                    onClick={handleGenerer}
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
                    <span>{idees.length} idées générées pour &quot;{prompt}&quot;</span>
                    <button
                        onClick={() => {
                            setIdees(IDEES_INITIALES);
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
                {idees.map((idee) => (
                    <IdeeCard key={idee.id} idee={idee} isNew={generated} onDetailClick={handleDetail}/>
                ))}
            </div>

        </div>
    );
}
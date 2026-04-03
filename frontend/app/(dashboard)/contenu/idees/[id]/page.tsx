"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
    ArrowLeft,
    Globe,
    PenLine,
    BookmarkPlus,
    Share2,
} from "lucide-react";

type Plateforme = "LinkedIn post" | "Instagram post" | "Blog website";

type Idee = {
    id: number;
    titre: string;
    date: string;
    plateforme: Plateforme;
    description: string;
    motsCles: string[];
    angle: string;
    structure: string[];
};

const IDEE: Idee = {
    id: 1,
    titre: "Le SEO en 2026 : Ce qui fonctionne vraiment",
    date: "11 Jan 2022",
    plateforme: "LinkedIn post",
    description:
        "Le référencement évolue rapidement. Découvrez les stratégies SEO réellement efficaces en 2026 pour améliorer votre visibilité, attirer du trafic qualifié et rester compétitif face aux nouvelles exigences des moteurs de recherche.",
    motsCles: ["SEO 2026", "référencement naturel", "stratégie SEO", "trafic organique", "Google SGE"],
    angle:
        "Prendre le contrepied des idées reçues sur le SEO — montrer que ce qui fonctionnait en 2022 est aujourd'hui contre-productif, et révéler les nouvelles règles du jeu.",
    structure: [
        "Accroche : une statistique surprenante sur la baisse du clic organique",
        "Ce qui ne fonctionne plus (et pourquoi)",
        "Les 3 piliers du SEO en 2026 : autorité, intention, expérience",
        "Exemples concrets de sites qui ont adapté leur stratégie",
        "Call to action : audit de votre propre contenu",
    ],
};


const PLATEFORME_CONFIG: Record<
    Plateforme,
    { icon: React.ReactNode; color: string; bg: string }
> = {
    "LinkedIn post": {
        icon: <Globe size={14}/>,
        color: "text-blue-700",
        bg: "bg-blue-100",
    },
    "Instagram post": {
        icon: <Globe size={14}/>,
        color: "text-purple-700",
        bg: "bg-purple-100",
    },
    "Blog website": {
        icon: <Globe size={14}/>,
        color: "text-yellow-700",
        bg: "bg-yellow-100",
    },
};

export default function IdeeDetailPage() {
    const router = useRouter();
    const config = PLATEFORME_CONFIG[IDEE.plateforme];

    const handleEdit = () => {
        router.push(`/contenu/redaction?idee=${IDEE.id}`);
    };

    return (
        <div className="flex flex-col gap-6 max-w-full h-full">
            <div className="flex items-center gap-2">
                <Link
                    href="/contenu/idees"
                    className="flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors"
                >
                    <ArrowLeft size={14}/>
                    Génération d&apos;idées
                </Link>
                <span className="text-base-content/30 text-sm">›</span>
                <span className="text-sm text-base-content/40 line-clamp-1">{IDEE.titre}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 flex-1">
                <div className="flex-1 flex flex-col gap-4">
                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-6 gap-4">
                            <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                                  {config.icon}
                                    {IDEE.plateforme}
                                </span>
                                <span className="text-xs text-base-content/40">{IDEE.date}</span>
                            </div>

                            <h1 className="text-xl font-bold font-display leading-snug">
                                {IDEE.titre}
                            </h1>

                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {IDEE.description}
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-6 gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-base-content/40">
                                Angle éditorial
                            </h2>
                            <p className="text-sm text-base-content/70 leading-relaxed">
                                {IDEE.angle}
                            </p>
                        </div>
                    </div>

                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-6 gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-base-content/40">
                                Structure suggérée
                            </h2>
                            <ol className="flex flex-col gap-2.5">
                                {IDEE.structure.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                    <span className="shrink-0 w-5 h-5 rounded-full bg-base-200 text-base-content/50 text-xs flex items-center justify-center font-semibold mt-0.5">
                                      {i + 1}
                                    </span>
                                        <span className="text-base-content/70 leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ol>
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

                            <button className="btn btn-outline btn-sm w-full gap-2 rounded-full">
                                <BookmarkPlus size={14}/>
                                Sauvegarder
                            </button>

                            <button className="btn btn-ghost btn-sm w-full gap-2 rounded-full">
                                <Share2 size={14}/>
                                Partager
                            </button>
                        </div>
                    </div>

                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-5 gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-base-content/40">
                                Mots-clés ciblés
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {IDEE.motsCles.map((mot) => (
                                    <span key={mot} className="badge badge-ghost text-xs">
                    {mot}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-5 gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-wide text-base-content/40">
                                Plateforme cible
                            </h2>
                            <div className={`flex items-center gap-2 text-sm font-medium ${config.color}`}>
                                {config.icon}
                                {IDEE.plateforme}
                            </div>
                            <p className="text-xs text-base-content/40 leading-relaxed">
                                {IDEE.plateforme === "LinkedIn post" &&
                                    "Format court à moyen, ton professionnel, accroche forte, 1 hashtag par thème."}
                                {IDEE.plateforme === "Instagram post" &&
                                    "Visuel fort, légende courte et engageante, 5–10 hashtags pertinents."}
                                {IDEE.plateforme === "Blog website" &&
                                    "Article long format (+800 mots), structuré en Hn, optimisé SEO on-page."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
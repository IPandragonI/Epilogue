import Link from "next/link";
import {CheckCircle2, XCircle, RefreshCw} from "lucide-react";
import SeoScoreGauge from "@/app/components/content/SeoScoreGauge";
import ContentRenderer from "@/app/components/content/ContentRenderer";
import {Content, NotionSyncStatus, Platform, Status} from "@/app/types/types";

const CONTENT: Content = {
    id: 1,
    title: "Guide SEO 2026 : Les tendances majeures",
    seo: {
        score: 78,
        review: '[{"title":"Mots-clés principaux","detail":"Présence confirmée (8/10)","ok":true},{"title":"Structure Hn","detail":"Séquence logique H1 > H2","ok":true},{"title":"Densité de mots clés","detail":"Risque de suroptimisation","ok":false}]',
        keywords: ["SEO", "IA", "Moteurs de recherche", "Tendances SEO 2026"]
    },
    date: "1/11/2050",
    platform: Platform.LINKEDIN,
    status: Status.PUBLISHED,
    notion: {notionSyncStatus: NotionSyncStatus.SYNCED},
    body: `Le SEO n'a jamais été un terrain stable, mais 2026 marque un tournant encore plus net : entre l'essor de l'IA, les nouvelles attentes des utilisateurs et les mutations des moteurs de recherche, les règles du jeu évoluent rapidement.
Pour rester visible, il ne suffit plus d'optimiser des mots-clés — il faut comprendre l'écosystème global de la recherche.

Voici les grandes tendances SEO à suivre en 2026.

## 1. L'IA au cœur des résultats de recherche

Les moteurs de recherche intègrent désormais massivement l'intelligence artificielle dans leurs résultats. Les réponses générées directement dans les pages (type "AI Overview") réduisent le besoin de cliquer sur les liens.

Conséquence :
• Moins de trafic organique classique
• Plus de concurrence pour apparaître dans les réponses générées

À faire :
• Structurer son contenu de manière claire (questions/réponses)
• Miser sur des contenus experts et approfondis
• Optimiser pour être cité comme source par les IA`,
};

function parseReview(review: string) {
    return JSON.parse(review) as { title: string; detail: string; ok: boolean }[];
}

function countWords(text: string) {
    return text.trim().split(/\s+/).length;
}

export default function PostDetailPage() {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-baseline gap-2 flex-wrap">
                <Link href="/content/posts" className="text-2xl font-bold font-display hover:underline underline-offset-2">
                    Mes posts
                </Link>
                <span className="text-2xl text-base-content/30">›</span>
                <h1 className="text-2xl font-display text-base-content/60">
                    {CONTENT.title}
                </h1>
            </div>

            <div className="flex gap-5 flex-1 min-h-0">
                <div className="flex-1 card bg-base-100 border border-base-300 shadow-xs overflow-hidden flex flex-col">
                    <div className="card-body p-6 overflow-y-auto flex-1">
                        <h2 className="text-base font-bold mb-4">{CONTENT.title}</h2>
                        <ContentRenderer text={CONTENT.body ?? ''}/>
                    </div>

                    <div className="flex items-center justify-between px-6 py-2.5 bg-base-content text-base-100 text-xs font-medium shrink-0">
                        <span>{countWords(CONTENT.body ?? '')} MOTS</span>
                        <span>Temps de lecture : {Math.ceil(countWords(CONTENT.body ?? '') / 200)} min</span>
                        <span className="flex items-center gap-1.5">
                            <RefreshCw size={11}/>
                            {CONTENT.notion?.notionSyncStatus}
                        </span>
                    </div>
                </div>

                <div className="w-72 shrink-0 flex flex-col gap-4">
                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-5 gap-5">

                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base">Analyse SEO</h3>
                            </div>

                            <div className="flex justify-center">
                                <SeoScoreGauge score={CONTENT.seo?.score ?? 0}/>
                            </div>

                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                                    Optimisation
                                </p>
                                {CONTENT.seo && CONTENT.seo.review && parseReview(CONTENT.seo.review).map((opt) => (
                                    <div key={opt.title} className="flex items-start gap-2.5">
                                        {opt.ok ? (
                                            <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5"/>
                                        ) : (
                                            <XCircle size={16} className="text-error shrink-0 mt-0.5"/>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium leading-tight">{opt.title}</p>
                                            <p className="text-xs text-base-content/40">{opt.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="divider my-0"/>

                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                                    Nuage de mots clés
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {CONTENT.seo && CONTENT.seo.keywords && CONTENT.seo.keywords.map((word) => (
                                        <span key={word} className="badge badge-ghost text-xs">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
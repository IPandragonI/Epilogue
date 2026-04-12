import {LayoutList, TrendingUp, Zap, ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight} from "lucide-react";
import {StatCard, Status, Content} from "@/app/types/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ScoreBar from "@/app/components/content/ScoreBar";
import StatusBadge from "@/app/components/content/StatusBadge";

const STATS: StatCard[] = [
    {
        label: "Total contenus",
        value: "128",
        icon: <LayoutList size={28} strokeWidth={1.5} className="text-base-content/30"/>,
    },
    {
        label: "Score SEO moyen",
        value: "84%",
        icon: <TrendingUp size={28} strokeWidth={1.5} className="text-base-content/30"/>,
    },
    {
        label: "Crédits IA restant",
        value: "42",
        icon: <Zap size={28} strokeWidth={1.5} className="text-base-content/30"/>,
    },
];

const CONTENTS: Content[] = [
    {
        id: 1,
        title: "Guide SEO 2026 : Les tendances à suivre pour booster votre référencement",
        date: "1/11/2050",
        seo: {score: 92},
        status: Status.PUBLISHED
    },
    {
        id: 2,
        title: "Stratégie content marketing : Comment créer un calendrier éditorial efficace ?",
        date: "1/11/2050",
        seo: {score: 57},
        status: Status.PUBLISHED
    },
    {id: 3, title: "Top outils 10 IA pour copywriters en 2026", date: "1/11/2050", seo: {score: 86}, status: Status.DRAFT},
    {
        id: 4,
        title: "Comment optimiser son site pour la recherche vocale en 2026 ?",
        date: "1/11/2050",
        seo: {score: 24},
        status: Status.DRAFT
    },
    {
        id: 5,
        title: "Les 10 erreurs à ne pas commettre en SEO en 2026",
        date: "1/11/2050",
        seo: {score: 58},
        status: Status.PUBLISHED
    },
    {id: 6, title: "Mes blogs SEO préférés à suivre en 2026", date: "1/11/2050", seo: {score: 88}, status: Status.DRAFT},
];


export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    //if (!token) {
      //  redirect("/login");
    //}

    return (
        <div className="flex flex-col gap-6 max-w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STATS.map((stat) => (
                    <div key={stat.label} className="card bg-base-100 shadow-xs border border-base-300">
                        <div className="card-body flex-row items-center justify-between p-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-base-content/50">{stat.label}</span>
                                <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                            </div>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card bg-base-100 shadow-xs border border-base-300">
                <div className="card-body p-0">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4">
                        <h2 className="text-lg font-bold font-display">Contenus récents</h2>
                        <div className="flex items-center gap-2">
                            <button className="btn btn-sm btn-outline rounded-full px-4">
                                Voir tout
                            </button>
                            <button className="btn btn-sm btn-ghost btn-square">
                                <MoreHorizontal size={16}/>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                            <tr className="border-base-300 text-base-content/50 text-xs uppercase tracking-wide">
                                <th className="font-medium pl-6">Titre</th>
                                <th className="font-medium">
                                <span className="flex items-center gap-1">
                                  Date <ArrowUpDown size={12}/>
                                </span>
                                </th>
                                <th className="font-medium">Score SEO</th>
                                <th className="font-medium">Status</th>
                                <th/>
                            </tr>
                            </thead>
                            <tbody>
                            {CONTENTS.map((content) => (
                                <tr key={content.id} className="border-base-300 hover:bg-base-200 transition-colors">
                                    <td className="pl-6 font-medium text-sm max-w-xs truncate">
                                        <a href={`/content/posts/${content.id}`} className="hover:underline">
                                            {content.title}
                                        </a>
                                    </td>
                                    <td className="text-sm text-base-content/50">{content.date}</td>
                                    <td><ScoreBar score={content.seo?.score ?? 0}/></td>
                                    <td><StatusBadge status={content.status}/></td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs btn-square">
                                            <MoreHorizontal size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 border-t border-base-300">
                        <button className="btn btn-sm btn-outline rounded-full gap-1">
                            <ChevronLeft size={14}/> Précédent
                        </button>

                        <div className="join">
                            {[1, 2, 3, 4].map((page) => (
                                <button
                                    key={page}
                                    className={`join-item btn btn-sm btn-ghost w-8 ${page === 1 ? "btn-active" : ""}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button className="btn btn-sm btn-outline rounded-full gap-1">
                            Suivant <ChevronRight size={14}/>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
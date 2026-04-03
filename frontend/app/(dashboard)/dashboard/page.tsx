import {LayoutList, TrendingUp, Zap, ArrowUpDown, MoreHorizontal, ChevronLeft, ChevronRight} from "lucide-react";

type StatCard = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

type Content = {
    id: number;
    titre: string;
    date: string;
    scoreSeo: number;
    status: "Publié" | "Brouillon" | "En cours de syncro";
};

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
    {id: 1, titre: "Guide SEO 2026 : Les tend...", date: "1/11/2050", scoreSeo: 92, status: "Publié"},
    {id: 2, titre: "Stratégie content marketi...", date: "1/11/2050", scoreSeo: 57, status: "Publié"},
    {id: 3, titre: "Top outils 10 IA pour copy...", date: "1/11/2050", scoreSeo: 86, status: "Brouillon"},
    {id: 4, titre: "Comment optimiser son si...", date: "1/11/2050", scoreSeo: 24, status: "En cours de syncro"},
    {id: 5, titre: "Les 10 erreurs à ne pas co...", date: "1/11/2050", scoreSeo: 58, status: "Publié"},
    {id: 6, titre: "Mes blogs SEO préférés à...", date: "1/11/2050", scoreSeo: 88, status: "En cours de syncro"},
];


function StatusBadge({status}: { status: Content["status"] }) {
    const styles: Record<Content["status"], string> = {
        Publié: "badge-success",
        Brouillon: "badge-warning",
        "En cours de syncro": "badge-info",
    };

    return (
        <span className={`badge badge-soft badge-sm font-medium ${styles[status]}`}>
      {status}
    </span>
    );
}


export default function DashboardPage() {
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
                                        {content.titre}
                                    </td>
                                    <td className="text-sm text-base-content/50">{content.date}</td>
                                    <td className="text-sm font-medium">{content.scoreSeo}</td>
                                    <td>
                                        <StatusBadge status={content.status}/>
                                    </td>
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
                            <ChevronLeft size={14}/> Prev
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
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
import {LayoutList, TrendingUp, Zap} from "lucide-react";
import {StatCard} from "@/app/types/types";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import Link from "next/link";
import PostTable from "../content/posts/table";

//TODO faire une route /stats
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

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token");

    if (!token) redirect("/login");

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
                            <Link href="/content/posts" className="btn btn-sm btn-outline rounded-full px-4">
                                Voir tout
                            </Link>
                        </div>
                    </div>

                    <PostTable/>
                </div>
            </div>

        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { FileCheck2, FileText, Clock, TrendingUp, Loader2 } from "lucide-react";

interface DashboardStats {
    total: number;
    published: number;
    draft: number;
    waitingPublish: number;
    avgSeoScore: number;
    byPlatform: { BLOG: number; LINKEDIN: number; TWITTER: number; INSTAGRAM: number };
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    sub?: string;
    accent?: boolean;
}

function StatCard({ label, value, icon, sub, accent }: StatCardProps) {
    return (
        <div className="card bg-base-100 shadow-xs border border-base-300">
            <div className="card-body flex-row items-center justify-between p-5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-base-content/50 font-medium">{label}</span>
                    <span className={`text-3xl font-bold tracking-tight ${accent ? "text-accent" : ""}`}>
                        {value}
                    </span>
                    {sub && <span className="text-xs text-base-content/35 mt-0.5">{sub}</span>}
                </div>
                <div className="w-11 h-11 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function StatCards() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/stats`)
            .then((r) => (r.ok ? r.json() : null))
            .then(setStats)
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="animate-spin text-accent" size={28} />
            </div>
        );
    }

    const s = stats ?? { total: 0, published: 0, draft: 0, waitingPublish: 0, avgSeoScore: 0, byPlatform: { BLOG: 0, LINKEDIN: 0, TWITTER: 0, INSTAGRAM: 0 } };
    const publishRate = s.total > 0 ? Math.round((s.published / s.total) * 100) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Posts publiés"
                value={s.published}
                sub={`${publishRate}% du total`}
                icon={<FileCheck2 size={22} strokeWidth={1.5} className="text-success/70" />}
            />
            <StatCard
                label="Brouillons"
                value={s.draft}
                sub={s.waitingPublish > 0 ? `+ ${s.waitingPublish} en attente` : "en cours de rédaction"}
                icon={<FileText size={22} strokeWidth={1.5} className="text-base-content/30" />}
            />
            <StatCard
                label="En attente"
                value={s.waitingPublish}
                sub="à publier"
                icon={<Clock size={22} strokeWidth={1.5} className="text-warning/70" />}
            />
            <StatCard
                label="Score SEO moyen"
                value={s.avgSeoScore > 0 ? `${s.avgSeoScore}%` : "—"}
                sub={s.total > 0 ? `sur ${s.total} contenus` : "aucun contenu"}
                accent={s.avgSeoScore > 0}
                icon={<TrendingUp size={22} strokeWidth={1.5} className="text-accent/70" />}
            />
        </div>
    );
}

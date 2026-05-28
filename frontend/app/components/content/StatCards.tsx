"use client";

import {StatCard} from "@/app/types/types";
import {LayoutList, Loader2, TrendingUp, Zap} from "lucide-react";
import {useEffect, useState} from "react";

const statIcons = [
    <LayoutList key="views" size={28} strokeWidth={1.5} className="text-base-content/30"/>,
    <TrendingUp key="growth" size={28} strokeWidth={1.5} className="text-base-content/30"/>,
    <Zap key="performance" size={28} strokeWidth={1.5} className="text-base-content/30"/>,
];

export default function StatCards() {
    const [stats, setStats] = useState<StatCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/stats`);
            if (!response.ok) {
                setError("Failed to fetch stats");
                return;
            }
            const data = await response.json();
            setStats(data);
        } catch {
            setError("Failed to fetch stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="animate-spin text-accent" size={32}/>
            </div>
        );
    }

    if (error) return <div className="text-error">{error}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div key={stat.label} className="card bg-base-100 shadow-xs border border-base-300">
                    <div className="card-body flex-row items-center justify-between p-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-base-content/50">{stat.label}</span>
                            <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                        </div>
                        {statIcons[index]}
                    </div>
                </div>
            ))}
        </div>
    );
}
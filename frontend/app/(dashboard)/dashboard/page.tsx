"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import PostTable from "../content/posts/table";
import StatCards from "@/app/components/content/StatCards";
import QuotaWidget from "@/app/components/dashboard/QuotaWidget";
import PlatformWidget from "@/app/components/dashboard/PlatformWidget";

interface DashboardStats {
    total: number;
    published: number;
    draft: number;
    waitingPublish: number;
    avgSeoScore: number;
    byPlatform: { BLOG: number; LINKEDIN: number; TWITTER: number; INSTAGRAM: number };
}

const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function formatDate(d: Date) {
    return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }
        // console.log("User role:", user?.role);
        if (!authLoading && user?.role === "super_admin") {
            router.push("/admin/agencies");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/stats`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : null))
            .then(setStats)
            .catch(() => setStats(null));
    }, []);

    if (authLoading || !user) return null;

    const today = new Date();

    return (
        <div className="flex flex-col gap-6 max-w-full">

            {/* Greeting */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <p className="text-xs text-base-content/40 uppercase tracking-widest font-semibold mb-0.5">
                        {formatDate(today)}
                    </p>
                    <h1 className="text-2xl font-bold text-base-content">
                        Bonjour, {user.firstname} 👋
                    </h1>
                    {user.agency?.name && (
                        <p className="text-sm text-base-content/45 mt-0.5">{user.agency.name}</p>
                    )}
                </div>
                <Link href="/content/writing" className="btn btn-sm bg-accent border-0 text-white hover:bg-accent/85 gap-2 shrink-0">
                    + Nouveau post
                </Link>
            </div>

            {/* Stat cards */}
            <StatCards />

            {/* Quota + Platform */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <QuotaWidget />
                </div>
                <div>
                    <PlatformWidget
                        byPlatform={stats?.byPlatform ?? { BLOG: 0, LINKEDIN: 0, TWITTER: 0, INSTAGRAM: 0 }}
                        total={stats?.total ?? 0}
                    />
                </div>
            </div>

            {/* Recent posts */}
            <div className="card bg-base-100 shadow-xs border border-base-300">
                <div className="card-body p-0">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4">
                        <h2 className="text-lg font-bold font-display">Contenus récents</h2>
                        <Link href="/content/posts" className="btn btn-sm btn-outline rounded-full px-4">
                            Voir tout
                        </Link>
                    </div>
                    <PostTable />
                </div>
            </div>

        </div>
    );
}

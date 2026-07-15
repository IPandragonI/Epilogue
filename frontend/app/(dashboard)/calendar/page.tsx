"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Content, ContentStatus } from "@/app/types/types";
import { useAuth } from "@/app/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const PLATFORM_COLOR: Record<string, string> = {
    BLOG: "#EAB308",
    LINKEDIN: "#3B82F6",
    TWITTER: "#06B6D4",
    INSTAGRAM: "#A855F7",
};

const STATUS_COLOR: Record<string, string> = {
    PUBLISHED: "#16A34A",
    DRAFT: "#9CA3AF",
    WAITING_PUBLISH: "#D97706",
};

function dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildCalendarDays(year: number, month: number): Date[] {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1; // Mon = 0

    const days: Date[] = [];
    for (let i = startOffset; i > 0; i--) {
        days.push(new Date(year, month, 1 - i));
    }
    for (let d = 1; d <= last.getDate(); d++) {
        days.push(new Date(year, month, d));
    }
    const tail = days.length % 7;
    if (tail !== 0) {
        for (let i = 1; i <= 7 - tail; i++) {
            days.push(new Date(year, month + 1, i));
        }
    }
    return days;
}

function resolveDate(c: Content): Date {
    const raw =
        (c.status === ContentStatus.WAITING_PUBLISH && c.scheduledPublishDate) ||
        (c as any).publishedDate ||
        (c as any).createdAt ||
        c.date;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

export default function CalendrierPage() {
    const { user } = useAuth();
    const hasAgency = !!user?.agency;
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [scope, setScope] = useState<"own" | "agency">("own");
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const query = hasAgency && scope === "agency" ? "?scope=agency" : "";
        fetch(`${API_URL}/content${query}`, { credentials: "include" })
            .then((r) => r.json())
            .then((data) => setContents(Array.isArray(data) ? data : []))
            .catch(() => setContents([]))
            .finally(() => setLoading(false));
    }, [scope, hasAgency]);

    const days = useMemo(() => buildCalendarDays(year, month), [year, month]);
    const todayKey = dateKey(today);

    const byDay = useMemo(() => {
        const map: Record<string, Content[]> = {};
        for (const c of contents) {
            const k = dateKey(resolveDate(c));
            (map[k] ??= []).push(c);
        }
        return map;
    }, [contents]);

    const monthContents = useMemo(
        () => contents.filter((c) => {
            const d = resolveDate(c);
            return d.getFullYear() === year && d.getMonth() === month;
        }),
        [contents, year, month],
    );

    const stats = {
        total: monthContents.length,
        published: monthContents.filter((c) => c.status === ContentStatus.PUBLISHED).length,
        draft: monthContents.filter((c) => c.status === ContentStatus.DRAFT).length,
        waiting: monthContents.filter((c) => c.status === ContentStatus.WAITING_PUBLISH).length,
    };

    const todayRowIndex = useMemo(() => {
        const idx = days.findIndex((d) => dateKey(d) === todayKey);
        return idx >= 0 ? Math.floor(idx / 7) : -1;
    }, [days, todayKey]);

    function prev() {
        if (month === 0) { setYear((y) => y - 1); setMonth(11); }
        else setMonth((m) => m - 1);
    }
    function next() {
        if (month === 11) { setYear((y) => y + 1); setMonth(0); }
        else setMonth((m) => m + 1);
    }
    function goToday() {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    }

    const totalRows = Math.ceil(days.length / 7);

    return (
        <div className="flex flex-col gap-5 max-w-full">

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Calendrier éditorial</h1>
                    <p className="text-sm text-base-content/50 mt-0.5">
                        Vue mensuelle de vos publications
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {hasAgency && (
                        <div className="join">
                            <button
                                onClick={() => setScope("own")}
                                className={`join-item btn btn-sm rounded-l-full ${scope === "own" ? "btn-active" : "btn-outline"}`}
                            >
                                Mes posts
                            </button>
                            <button
                                onClick={() => setScope("agency")}
                                className={`join-item btn btn-sm rounded-r-full ${scope === "agency" ? "btn-active" : "btn-outline"}`}
                            >
                                Toute l&apos;agence
                            </button>
                        </div>
                    )}
                    <Link
                        href="/content/writing"
                        className="btn btn-accent btn-sm gap-2 rounded-full px-4"
                    >
                        <Plus size={15} />
                        Nouveau post
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Posts ce mois", value: stats.total, cls: "" },
                    { label: "Publiés", value: stats.published, cls: "text-success" },
                    { label: "Brouillons", value: stats.draft, cls: "text-base-content/45" },
                    { label: "En attente", value: stats.waiting, cls: "text-warning" },
                ].map(({ label, value, cls }) => (
                    <div key={label} className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-4 gap-0.5">
                            <span className={`text-2xl font-bold tracking-tight ${cls}`}>
                                {value}
                            </span>
                            <span className="text-xs text-base-content/45">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card bg-base-100 border border-base-300 shadow-xs overflow-hidden">

                <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={prev}
                            className="btn btn-ghost btn-sm btn-square rounded-lg"
                            aria-label="Mois précédent"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={goToday}
                            className="btn btn-ghost btn-sm rounded-lg px-3 font-semibold text-sm min-w-37 tabular-nums"
                        >
                            {MONTHS_FR[month]} {year}
                        </button>
                        <button
                            onClick={next}
                            className="btn btn-ghost btn-sm btn-square rounded-lg"
                            aria-label="Mois suivant"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {[
                            { label: "Publié", color: STATUS_COLOR.PUBLISHED },
                            { label: "En attente", color: STATUS_COLOR.WAITING_PUBLISH },
                            { label: "Brouillon", color: STATUS_COLOR.DRAFT },
                        ].map(({ label, color }) => (
                            <span
                                key={label}
                                className="flex items-center gap-1.5 text-xs text-base-content/45"
                            >
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: color }}
                                />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-base-300">
                    {DAYS_FR.map((d, i) => (
                        <div
                            key={d}
                            className={`py-2 text-center text-xs font-semibold uppercase tracking-wider select-none
                                ${i >= 5 ? "text-base-content/30" : "text-base-content/40"}`}
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <span className="loading loading-spinner loading-md text-accent" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7">
                        {days.map((day, i) => {
                            const col = i % 7;
                            const row = Math.floor(i / 7);
                            const k = dateKey(day);
                            const isCurrent = day.getMonth() === month;
                            const isToday = k === todayKey;
                            const isWeekend = col >= 5;
                            const isCurrentWeek = row === todayRowIndex;
                            const isLastRow = row === totalRows - 1;
                            const isLastCol = col === 6;
                            const dayContents = byDay[k] || [];
                            const visible = dayContents.slice(0, 3);
                            const extra = dayContents.length - visible.length;

                            return (
                                <div
                                    key={`${k}-${i}`}
                                    className={[
                                        "relative flex flex-col gap-1 p-1.5 min-h-27",
                                        !isLastRow ? "border-b border-base-200" : "",
                                        !isLastCol ? "border-r border-base-200" : "",
                                        isWeekend
                                            ? "bg-base-50"
                                            : isCurrentWeek
                                                ? "bg-primary/2.5"
                                                : "bg-base-100",
                                        !isCurrent ? "opacity-35" : "",
                                    ].filter(Boolean).join(" ")}
                                >
                                    <div className="flex items-start justify-between mb-0.5">
                                        <span
                                            className={[
                                                "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full shrink-0 leading-none",
                                                isToday
                                                    ? "bg-primary text-primary-content"
                                                    : isWeekend
                                                        ? "text-base-content/30"
                                                        : "text-base-content/60",
                                            ].join(" ")}
                                        >
                                            {day.getDate()}
                                        </span>
                                        {extra > 0 && (
                                            <span className="text-[10px] text-base-content/35 font-medium leading-6 pr-0.5">
                                                +{extra}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-0.5">
                                        {visible.map((c) => (
                                            <Link
                                                key={c.id}
                                                href={`/content/posts/${c.id}`}
                                                title={scope === "agency" && c.user ? `${c.title} — ${c.user.firstname} ${c.user.lastname}` : c.title}
                                                className="flex items-center gap-1.5 px-1.5 py-0.75 rounded bg-base-200/60 hover:bg-base-200 transition-colors group cursor-pointer"
                                                style={{
                                                    borderLeft: `2.5px solid ${PLATFORM_COLOR[c.contentPlatform ?? "BLOG"] ?? "#9CA3AF"}`,
                                                }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                    style={{ background: STATUS_COLOR[c.status] ?? "#9CA3AF" }}
                                                />
                                                <span className="text-[10px] font-medium text-base-content/55 group-hover:text-base-content/80 truncate leading-snug transition-colors">
                                                    {c.title}
                                                    {scope === "agency" && c.user && (
                                                        <span className="text-base-content/35"> · {c.user.firstname}</span>
                                                    )}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-5 flex-wrap pb-1">
                <span className="text-xs text-base-content/35 font-medium">Plateforme</span>
                {Object.entries(PLATFORM_COLOR).map(([platform, color]) => (
                    <span
                        key={platform}
                        className="flex items-center gap-1.5 text-xs text-base-content/45"
                    >
                        <span
                            className="w-3 h-[2.5px] rounded-full inline-block"
                            style={{ background: color }}
                        />
                        {platform.charAt(0) + platform.slice(1).toLowerCase()}
                    </span>
                ))}
            </div>
        </div>
    );
}

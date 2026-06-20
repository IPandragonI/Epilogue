"use client";

import { BarChart2 } from "lucide-react";

interface Props {
    byPlatform: { BLOG: number; LINKEDIN: number; TWITTER: number; INSTAGRAM: number };
    total: number;
}

const PLATFORMS = [
    { key: "BLOG",      label: "Blog",      color: "bg-yellow-400", text: "text-yellow-700" },
    { key: "LINKEDIN",  label: "LinkedIn",  color: "bg-blue-500",   text: "text-blue-700" },
    { key: "INSTAGRAM", label: "Instagram", color: "bg-purple-500", text: "text-purple-700" },
    { key: "TWITTER",   label: "Twitter",   color: "bg-cyan-400",   text: "text-cyan-700" },
] as const;

export default function PlatformWidget({ byPlatform, total }: Props) {
    const max = Math.max(...Object.values(byPlatform), 1);

    return (
        <div className="card bg-base-100 border border-base-300 shadow-xs h-full">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-base-300">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <BarChart2 size={14} strokeWidth={1.8} />
                </div>
                <h2 className="text-sm font-bold text-base-content">Répartition plateformes</h2>
            </div>

            <div className="p-5 flex flex-col gap-3.5">
                {PLATFORMS.map(({ key, label, color, text }) => {
                    const count = byPlatform[key];
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const barWidth = total > 0 ? (count / max) * 100 : 0;

                    return (
                        <div key={key} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-base-content/70">{label}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-bold ${text}`}>{count}</span>
                                    <span className="text-xs text-base-content/30">({pct}%)</span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                    );
                })}

                {total === 0 && (
                    <p className="text-xs text-base-content/30 text-center py-2">
                        Aucun contenu créé pour l&apos;instant.
                    </p>
                )}
            </div>
        </div>
    );
}

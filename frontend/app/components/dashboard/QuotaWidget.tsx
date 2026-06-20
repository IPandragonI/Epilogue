"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { AgencySubscription } from "@/app/types/types";
import { CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

interface UsageRow {
    label: string;
    used: number;
    max: number;
    color: string;
}

function QuotaBar({ label, used, max, color }: UsageRow) {
    const unlimited = max >= 999_999;
    const pct = unlimited ? 0 : Math.min((used / max) * 100, 100);
    const critical = pct > 90;
    const warning = pct > 70;
    const barColor = critical ? "bg-error" : warning ? "bg-warning" : color;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-base-content/70">{label}</span>
                <span className={`text-xs font-semibold ${critical ? "text-error" : "text-base-content/50"}`}>
                    {unlimited ? "Illimité" : `${used.toLocaleString("fr-FR")} / ${max.toLocaleString("fr-FR")}`}
                </span>
            </div>
            <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${unlimited ? 0 : pct}%` }}
                />
            </div>
            {critical && (
                <p className="text-xs text-error">Quota presque atteint — pensez à changer de plan.</p>
            )}
        </div>
    );
}

export default function QuotaWidget() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<AgencySubscription | null>(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);

    useEffect(() => {
        const agencyId = user?.agency?.id;
        if (!agencyId) return;

        fetch(`${API}/agency-subscriptions/agency/${agencyId}`, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : null))
            .then(setSubscription)
            .catch(() => setSubscription(null))
            .finally(() => setLoadingSubscription(false));
    }, [user?.agency?.id]);

    const plan = subscription?.subscriptionPlan;

    const rows: UsageRow[] = plan ? [
        {
            label: "Tokens IA",
            used: user?.nbTokenUsedThisMonth ?? 0,
            max: plan.maxTokenPerMonth,
            color: "bg-accent",
        },
        {
            label: "Curations",
            used: user?.nbCurationUsedThisMonth ?? 0,
            max: plan.maxCurationPerMonth,
            color: "bg-primary",
        },
        {
            label: "Générations d'idées",
            used: user?.nbIdeaGenerationUsedThisMonth ?? 0,
            max: plan.maxIdeaGenerationPerMonth,
            color: "bg-info",
        },
    ] : [];

    return (
        <div className="card bg-base-100 border border-base-300 shadow-xs h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <CreditCard size={14} strokeWidth={1.8} />
                    </div>
                    <h2 className="text-sm font-bold text-base-content">Consommation mensuelle</h2>
                </div>
                {plan && (
                    <span className="badge badge-sm bg-primary/10 text-primary border-0 font-semibold">
                        {plan.name}
                    </span>
                )}
            </div>

            <div className="p-5">
                {loadingSubscription || !user ? (
                    <div className="flex justify-center py-6">
                        <Loader2 size={20} className="animate-spin text-base-content/30" />
                    </div>
                ) : !plan ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <p className="text-sm text-base-content/50">Aucun abonnement actif.</p>
                        <Link href="/pricing" className="btn btn-xs bg-accent border-0 text-white hover:bg-accent/85">
                            Choisir un plan
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {rows.map((row) => (
                            <QuotaBar key={row.label} {...row} />
                        ))}
                        <p className="text-xs text-base-content/30 pt-1">
                            Les compteurs se réinitialisent automatiquement chaque mois.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

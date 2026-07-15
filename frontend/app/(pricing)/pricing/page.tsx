"use client";

import {Suspense, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuth} from "../../hooks/useAuth";
import {AgencySubscription, BillingCycle, SubscriptionPlan} from "../../types/types";
import {
    Check,
    Sparkles,
    Zap,
    Building2,
    Gift,
    Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

const API = process.env.NEXT_PUBLIC_API_URL;

function formatLimit(value: number): string {
    if (value >= 999_999) return "Illimité";
    if (value >= 1_000) return `${(value / 1000).toLocaleString("fr-FR")}k`;
    return value.toString();
}

function getPlanTier(internalName: string): string {
    if (internalName === "FREE") return "FREE";
    if (internalName.startsWith("STARTER")) return "STARTER";
    if (internalName.startsWith("PRO")) return "PRO";
    return "ENTERPRISE";
}

const TIER_META: Record<string, { icon: React.ReactNode; badge?: string; highlight: boolean }> = {
    FREE: {icon: <Gift size={22}/>, highlight: false},
    STARTER: {icon: <Zap size={22}/>, highlight: false},
    PRO: {icon: <Sparkles size={22}/>, badge: "Recommandé", highlight: true},
    ENTERPRISE: {icon: <Building2 size={22}/>, highlight: false},
};

function PlanFeatures({plan}: { plan: SubscriptionPlan }) {
    const features = [
        {label: "Tokens IA / mois", value: formatLimit(plan.maxTokenPerMonth)},
        {label: "Curations / mois", value: formatLimit(plan.maxCurationPerMonth)},
        {label: "Idées générées / mois", value: formatLimit(plan.maxIdeaGenerationPerMonth)},
    ];

    return (
        <ul className="flex flex-col gap-2.5 mt-6">
            {features.map(({label, value}) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center">
                        <Check size={11} className="text-accent" strokeWidth={3}/>
                    </span>
                    <span className="text-base-content/70">
                        <span className="font-semibold text-base-content">{value}</span> {label}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function PlanCard({
                      plan,
                      isCurrent,
                      isAdmin,
                      onSelect,
                      loading,
                  }: {
    plan: SubscriptionPlan;
    isCurrent: boolean;
    isAdmin: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
    loading: boolean;
}) {
    const tier = getPlanTier(plan.internalName);
    const meta = TIER_META[tier] ?? TIER_META.FREE;
    const isFree = plan.price === 0;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border p-6 transition-shadow
                ${meta.highlight
                ? "border-accent shadow-lg shadow-accent/10 bg-base-100"
                : "border-base-300 bg-base-100 hover:shadow-md"
            }
                ${isCurrent ? "ring-2 ring-primary" : ""}
            `}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <span
                    className={`p-2 rounded-xl ${meta.highlight ? "bg-accent/10 text-accent" : "bg-base-200 text-base-content/60"}`}>
                    {meta.icon}
                </span>
                <div className="flex flex-col items-end gap-1">
                    {isCurrent && (
                        <span className="badge badge-sm bg-primary text-white border-0 px-2">
                            Votre plan
                        </span>
                    )}
                    {meta.badge && !isCurrent && (
                        <span className="badge badge-sm bg-accent text-white border-0 px-2">
                            {meta.badge}
                        </span>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-lg mt-3 text-base-content">{plan.name}</h3>
            <p className="text-sm text-base-content/55 mt-1 leading-relaxed min-h-[40px]">
                {plan.description}
            </p>

            <div className="mt-5 flex items-end gap-1">
                {isFree ? (
                    <span className="text-3xl font-extrabold text-base-content">Gratuit</span>
                ) : (
                    <>
                        <span className="text-3xl font-extrabold text-base-content">
                            {plan.price}€
                        </span>
                        <span className="text-sm text-base-content/50 mb-1">
                            /{plan.billingCycle === "YEARLY" ? "an" : "mois"}
                        </span>
                    </>
                )}
            </div>

            <PlanFeatures plan={plan}/>

            <div className="mt-auto pt-6">
                {isCurrent ? (
                    <button
                        disabled
                        className="btn btn-sm w-full bg-base-200 text-base-content/40 border-0 cursor-default"
                    >
                        Plan actuel
                    </button>
                ) : isAdmin ? (
                    <button
                        onClick={() => onSelect(plan)}
                        disabled={loading}
                        className={`btn btn-sm w-full border-0 text-white
                            ${meta.highlight ? "bg-accent hover:bg-accent/85" : "bg-primary hover:bg-primary/85"}
                        `}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin"/> : "Choisir ce plan"}
                    </button>
                ) : (
                    <button
                        disabled
                        className="btn btn-sm w-full bg-base-200 text-base-content/40 border-0 cursor-default"
                        title="Seul un administrateur peut changer le plan"
                    >
                        Contacter l&apos;admin
                    </button>
                )}
            </div>
        </div>
    );
}

function BillingToggle({
                           value,
                           onChange,
                       }: {
    value: BillingCycle;
    onChange: (v: BillingCycle) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={`text-sm font-medium ${value === "MONTHLY" ? "text-base-content" : "text-base-content/40"}`}>
                Mensuel
            </span>
            <input
                type="checkbox"
                className="toggle toggle-sm"
                style={{"--tglbg": "var(--color-accent)"} as React.CSSProperties}
                checked={value === "YEARLY"}
                onChange={(e) => onChange(e.target.checked ? "YEARLY" : "MONTHLY")}
            />
            <span
                className={`text-sm font-medium ${value === "YEARLY" ? "text-base-content" : "text-base-content/40"}`}>
                Annuel
            </span>
        </div>
    );
}

function UsageBar({label, used, max}: { label: string; used: number; max: number }) {
    const pct = max >= 999_999 ? 0 : Math.min((used / max) * 100, 100);
    const color = pct > 80 ? "bg-error" : pct > 50 ? "bg-warning" : "bg-accent";

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-base-content/60">
                <span>{label}</span>
                <span>{max >= 999_999 ? "Illimité" : `${used} / ${formatLimit(max)}`}</span>
            </div>
            <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{width: `${pct}%`}}/>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={null}>
            <PricingPageContent />
        </Suspense>
    );
}

function PricingPageContent() {
    const {user, loading: authLoading} = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [subscription, setSubscription] = useState<AgencySubscription | null>(null);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [changingPlan, setChangingPlan] = useState(false);

    const isAdmin = user?.role === "admin";
    const agencyId = user?.agency?.id;

    useEffect(() => {
        if (searchParams.get("canceled") === "true") {
            Swal.fire({
                title: "Paiement annulé",
                text: "Vous n'avez pas été débité. Vous pouvez choisir un plan à tout moment.",
                icon: "info",
                confirmButtonColor: "#547573",
            });
        }
    }, [searchParams]);

    useEffect(() => {
        fetch(`${API}/subscription-plans`)
            .then((r) => r.json())
            .then(setPlans)
            .catch(() => setPlans([]))
            .finally(() => setLoadingPlans(false));
    }, []);

    useEffect(() => {
        if (!agencyId) return;
        fetch(`${API}/agency-subscriptions/agency/${agencyId}`, {
            credentials: "include",
        })
            .then((r) => (r.ok ? r.json() : null))
            .then(setSubscription)
            .catch(() => setSubscription(null));
    }, [agencyId]);

    const visiblePlans = plans.filter(
        (p) => p.internalName === "FREE" || p.billingCycle === billingCycle,
    );

    const currentPlanId = subscription?.subscriptionPlanId ?? null;

    async function handleSelectPlan(plan: SubscriptionPlan) {
        if (!agencyId) return;

        const isFree = Number(plan.price) === 0;

        const result = await Swal.fire({
            title: isFree ? "Passer au plan gratuit ?" : "Procéder au paiement ?",
            html: isFree
                ? `Vous allez passer au plan <strong>${plan.name}</strong>.`
                : `Vous allez être redirigé vers Stripe pour payer le plan <strong>${plan.name}</strong> (${plan.price}€).`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: isFree ? "Confirmer" : "Payer avec Stripe",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#547573",
        });

        if (!result.isConfirmed) return;

        setChangingPlan(true);
        try {
            const res = await fetch(`${API}/payments/checkout`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({planId: plan.id, agencyId}),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error((err as { message?: string }).message ?? "Erreur lors de la création de la session");
            }

            const {url, free} = await res.json() as { url: string | null; free: boolean };

            if (free) {
                setSubscription(null);
                await Swal.fire({
                    title: "Plan activé !",
                    text: `Vous êtes maintenant sur le plan ${plan.name}.`,
                    icon: "success",
                    confirmButtonColor: "#547573",
                });
                router.refresh();
            } else if (url) {
                window.location.href = url;
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Une erreur est survenue";
            await Swal.fire({title: "Erreur", text: message, icon: "error", confirmButtonColor: "#547573"});
        } finally {
            setChangingPlan(false);
        }
    }

    if (authLoading || loadingPlans) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={28} className="animate-spin text-accent"/>
            </div>
        );
    }

    const activePlan = subscription?.subscriptionPlan ?? null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-10">

            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-base-content">Abonnement</h1>
                <p className="text-sm text-base-content/55">
                    Choisissez le plan adapté à la taille et aux besoins de votre agence.
                </p>
            </div>

            {activePlan && (
                <div className="rounded-2xl border border-base-300 bg-base-100 p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-base-content/40 font-semibold mb-0.5">
                                Plan actuel
                            </p>
                            <p className="font-bold text-lg text-base-content">{activePlan.name}</p>
                        </div>
                        <span className="badge badge-sm bg-primary/10 text-primary border-0">
                            Actif
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-base-200">
                        <UsageBar
                            label="Tokens IA"
                            used={user?.nbTokenUsedThisMonth ?? 0}
                            max={activePlan.maxTokenPerMonth}
                        />

                        <UsageBar
                            label="Curations"
                            used={user?.nbCurationUsedThisMonth ?? 0}
                            max={activePlan.maxCurationPerMonth}
                        />

                        <UsageBar
                            label="Générations d'idées"
                            used={user?.nbIdeaGenerationUsedThisMonth ?? 0}
                            max={activePlan.maxIdeaGenerationPerMonth}
                        />
                    </div>
                    <p className="text-xs text-base-content/40">
                        Utilisation pour {user?.usageMonth ?? "ce mois"}.
                        Les compteurs se réinitialisent automatiquement chaque mois.
                    </p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm font-medium text-base-content/70">
                    {visiblePlans.length} plan{visiblePlans.length > 1 ? "s" : ""} disponible{visiblePlans.length > 1 ? "s" : ""}
                </p>
                <BillingToggle value={billingCycle} onChange={setBillingCycle}/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visiblePlans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={plan.id === currentPlanId}
                        isAdmin={isAdmin}
                        onSelect={handleSelectPlan}
                        loading={changingPlan}
                    />
                ))}
            </div>

            {!isAdmin && (
                <p className="text-xs text-center text-base-content/40">
                    Seul un administrateur peut modifier l&apos;abonnement de l&apos;agence.
                </p>
            )}
        </div>
    );
}

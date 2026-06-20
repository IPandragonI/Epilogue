"use client";

import {useEffect, useState} from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {CheckCircle, ArrowRight, Loader2, XCircle} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL;

interface SessionSummary {
    planName: string;
    amount: number;
    currency: string;
}

export default function PricingSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get("session_id");

    const [summary, setSummary] = useState<SessionSummary | null>(null);
    const [loading, setLoading] = useState(!!sessionId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        fetch(`${API}/payments/verify`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({sessionId}),
        })
            .then(async (r) => {
                if (!r.ok) {
                    const err = await r.json().catch(() => ({}));
                    throw new Error((err as { message?: string }).message ?? "Vérification échouée");
                }
                return r.json();
            })
            .then((data: {
                subscription: { subscriptionPlan: { name: string; price: number } };
                session: { currency: string; amount_total?: number }
            }) => {
                console.log(data)
                setSummary({
                    planName: data.subscription?.subscriptionPlan?.name ?? "Votre plan",
                    amount: Number(data.subscription?.subscriptionPlan?.price ?? 0),
                    currency: (data.session?.currency as string)?.toUpperCase() ?? "EUR",
                });
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Une erreur est survenue");
            })
            .finally(() => setLoading(false));
    }, [sessionId]);

    useEffect(() => {
        if (!loading && !error) {
            const t = setTimeout(() => router.push("/dashboard"), 8000);
            return () => clearTimeout(t);
        }
    }, [loading, error, router]);

    if (!sessionId) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] px-4">
                <div
                    className="bg-base-100 border border-base-300 rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-sm">
                    <XCircle size={36} className="text-error" strokeWidth={1.5}/>
                    <p className="text-sm text-base-content/55">Aucune session de paiement trouvée.</p>
                    <Link href="/pricing" className="btn btn-sm bg-accent border-0 text-white hover:bg-accent/85">
                        Retour aux offres
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4">
            <div
                className="bg-base-100 border border-base-300 rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-sm">

                {loading ? (
                    <>
                        <Loader2 size={36} className="animate-spin text-accent" strokeWidth={1.5}/>
                        <p className="text-sm text-base-content/55">Vérification du paiement en cours…</p>
                    </>
                ) : error ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                            <XCircle size={36} className="text-error" strokeWidth={1.5}/>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-xl font-bold text-base-content">Vérification échouée</h1>
                            <p className="text-sm text-base-content/55">{error}</p>
                        </div>
                        <Link href="/pricing"
                              className="btn btn-sm bg-accent border-0 text-white hover:bg-accent/85 w-full">
                            Retour aux offres
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle size={36} className="text-success" strokeWidth={1.5}/>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h1 className="text-xl font-bold text-base-content">Paiement confirmé !</h1>
                            <p className="text-sm text-base-content/55">
                                Votre abonnement a bien été activé. Profitez de toutes les fonctionnalités de votre
                                nouveau plan.
                            </p>
                        </div>

                        {summary && (
                            <div className="w-full bg-base-200 rounded-xl px-5 py-4 flex flex-col gap-1.5 text-sm">
                                <div className="flex justify-between text-base-content/60">
                                    <span>Plan</span>
                                    <span className="font-medium text-base-content">{summary.planName}</span>
                                </div>
                                <div className="flex justify-between text-base-content/60">
                                    <span>Montant payé</span>
                                    <span className="font-medium text-base-content">
                                        {summary.amount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: summary.currency,
                                        })}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 w-full">
                            <Link
                                href="/dashboard"
                                className="btn btn-sm w-full bg-accent border-0 text-white hover:bg-accent/85"
                            >
                                Aller au dashboard <ArrowRight size={14}/>
                            </Link>
                            <Link
                                href="/pricing"
                                className="btn btn-sm btn-ghost w-full text-base-content/50"
                            >
                                Voir mon abonnement
                            </Link>
                        </div>

                        <p className="text-xs text-base-content/30">
                            Redirection automatique dans quelques secondes…
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

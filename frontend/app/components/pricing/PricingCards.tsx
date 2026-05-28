"use client";

import PricingCard from "@/app/components/pricing/PricingCard";
import {useEffect, useState} from "react";
import {SubscriptionPlan} from "@/app/types/types";
import {useAuth} from "@/app/hooks/useAuth";

export default function PricingCards({billingCycle}: { billingCycle: "MONTHLY" | "YEARLY" }) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [activePlanId, setActivePlanId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user} = useAuth();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const resPlans = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription-plan`);
                if (!resPlans.ok) throw new Error("Failed to fetch plans");
                const plansData = await resPlans.json();
                setPlans(plansData);
            } catch {
                setError("Impossible de charger les données de tarification.");
            } finally {
                setLoading(false);
            }
        };

        const fetchActivePlan = async () => {
            try {
                const resActivePlan = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agency-subscription/active/${user?.agencyId}`);
                if (!resActivePlan.ok) throw new Error("Failed to fetch active plan");
                const activePlanData = await resActivePlan.json();
                setActivePlanId(activePlanData.planId);
            } catch {
                // Ignore error, user might not have an active plan
            }
        };

        void fetchPlans();
        void fetchActivePlan();
    }, [user?.agencyId]);

    if (loading) return <div className="loading loading-dots loading-lg text-primary"></div>;
    if (error) return <p className="text-error font-medium">{error}</p>;

    const filteredPlans = plans.filter(plan => plan.billingCycle === billingCycle);

    return (
        <div className="flex flex-wrap items-stretch gap-6 w-full justify-center">
            {filteredPlans.map(plan => (
                <PricingCard
                    key={plan.id}
                    plan={plan}
                    isActive={plan.id === activePlanId}
                />
            ))}
        </div>
    );
}
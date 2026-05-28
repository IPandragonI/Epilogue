"use client";

import {useState} from "react";
import PricingCards from "@/app/components/pricing/PricingCards";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

    return (
        <div className="flex flex-col gap-6 max-w-full p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display">Tarifs</h1>

                <div className="flex items-center gap-4 px-4 py-2">
                    <span
                        className={`text-sm font-medium transition-all ${billingCycle === "YEARLY" ? "text-primary font-bold" : "opacity-50"}`}>Annuel</span>
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={billingCycle === "MONTHLY"}
                        onChange={(e) => setBillingCycle(e.target.checked ? "MONTHLY" : "YEARLY")}
                    />
                    <span
                        className={`text-sm font-medium transition-all ${billingCycle === "MONTHLY" ? "text-primary font-bold" : "opacity-50"}`}>Mensuel</span>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full h-full justify-center mt-6">
                <PricingCards billingCycle={billingCycle}/>
            </div>
        </div>
    );
}
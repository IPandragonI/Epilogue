import {SubscriptionPlan} from "@/app/types/types";
import Swal from "sweetalert2";
import {useAuth} from "@/app/hooks/useAuth";

export default function PricingCard({plan, isActive}: { plan: SubscriptionPlan, isActive: boolean }) {
    const {user} = useAuth();
    const showConfirmSubscriptionModal = () => {
        Swal.fire({
            title: "Etes-vous sûr de vouloir modifier votre offre?",
            text: "Cette action peut entraîner la perte de données si vous passez à une offre inférieure.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, je suis sûr!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const changePlan = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agency-subscription/change-plan`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({subscriptionPlanId: plan.id, agencyId: user?.agencyId})
                })
                if (!changePlan.ok) {
                    void Swal.fire("Erreur", "Impossible de changer d'offre. Veuillez réessayer plus tard.", "error");
                } else {
                    Swal.fire("Succès", "Votre offre a été mise à jour avec succès!", "success").then(() => {
                        window.location.reload();
                    });
                }
            }
        });
    }

    return (
        <div
            className={`card bg-base-100 shadow-xl hover-scale-105 ${isActive ? "border-primary" : "border-base-300"}`}>
            <div className="card-body">
                <div className="flex justify-between items-center mb-10">
                    <div className="text-5xl opacity-10">❁</div>
                    <div className="font-bold text-3xl">{plan.name}</div>
                </div>
                <div className="mb-4 opacity-40">{plan.description}
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-2xl font-bold">{plan.price} €</span>
                    <span className="text-sm opacity-40">/mois</span>
                </div>
                <ul className="mt-6 mb-4 text-sm opacity-40">
                    <li className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">✓</span>
                        Nombre de token par mois : {plan.maxTokenPerMonth}
                    </li>
                    <li className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">✓</span>
                        Nombre de curations par mois : {plan.maxCurationPerMonth}
                    </li>
                    <li className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">✓</span>
                        Nombre de génération d&apos;idées par mois : {plan.maxIdeaGenerationPerMonth}
                    </li>
                </ul>
                <div className="card-actions mt-auto w-full">
                    <button
                        className={`btn rounded-full w-full ${isActive ? "btn-neutral" : "btn-primary text-white hover:btn-accent"}`}
                        onClick={showConfirmSubscriptionModal}
                    >
                        {isActive ? "Gérer mon offre" : "Choisir ce plan"}
                    </button>
                </div>
            </div>
        </div>
    )
}
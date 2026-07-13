"use client";

import Link from "next/link";
import { Building2, Users, ShieldAlert, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { UserRole } from "@/app/types/types";
import AppLayout from "@/app/components/AppLayout";

function AdminCard({
                        href,
                        icon,
                        title,
                        description,
                    }: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="card bg-base-100 border border-base-300 rounded-xl p-5 flex flex-row items-center gap-4 hover:border-accent/40 hover:shadow-sm transition-all"
        >
            <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-base-content">{title}</h2>
                <p className="text-xs text-base-content/50 mt-0.5">{description}</p>
            </div>
            <ChevronRight size={16} className="text-base-content/30 shrink-0" />
        </Link>
    );
}

function AdminHomeContent() {
    const { user, loading } = useAuth();
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    const isAgencyAdmin = user?.role === UserRole.ADMIN;
    const hasAccess = isSuperAdmin || isAgencyAdmin;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-40">
                <p>Chargement…</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-40">
                <p>Utilisateur non connecté — veuillez vous connecter pour accéder à cette page.</p>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 min-h-60 max-w-md mx-auto text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <ShieldAlert size={22} strokeWidth={1.8} />
                </div>
                <h1 className="text-lg font-bold text-base-content">Accès restreint</h1>
                <p className="text-sm text-base-content/50">
                    Cette page est réservée aux administrateurs.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">
            <div>
                <h1 className="text-2xl font-bold text-base-content">Administration</h1>
                <p className="text-sm text-base-content/50 mt-1">
                    {isSuperAdmin ? "Gestion globale de la plateforme" : "Gestion de votre agence"}
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {isSuperAdmin && (
                    <AdminCard
                        href="/admin/agencies"
                        icon={<Building2 size={18} strokeWidth={1.8} />}
                        title="Entreprises"
                        description="Créer, renommer, supprimer des entreprises et gérer leur abonnement"
                    />
                )}
                <AdminCard
                    href="/admin/users"
                    icon={<Users size={18} strokeWidth={1.8} />}
                    title="Utilisateurs"
                    description={isSuperAdmin
                        ? "Gérer les comptes, rôles, et se connecter en tant qu'un utilisateur"
                        : "Gérer les membres de votre agence"}
                />
            </div>
        </div>
    );
}

export default function AdminHomePage() {
    return (
        <AppLayout>
            <AdminHomeContent />
        </AppLayout>
    );
}

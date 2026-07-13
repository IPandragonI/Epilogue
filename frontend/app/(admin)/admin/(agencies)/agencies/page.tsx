"use client";

import { useState, useEffect } from "react";
import {
    Building2,
    Users,
    Plus,
    X,
    Pencil,
    Trash,
    Check,
    ShieldAlert,
    ChevronDown,
    AlertCircle,
} from "lucide-react";
import { UserRole, SubscriptionPlan, AgencySubscription } from "@/app/types/types";
import { useAuth } from "@/app/hooks/useAuth";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────
interface AgencyUser {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: UserRole;
}

interface Agency {
    id: string;
    name: string;
    users?: AgencyUser[];
    userCount?: number;
}

// ── Section wrapper (identique à la page Paramètres) ───────────────────────
function Section({
                     title,
                     subtitle,
                     icon,
                     children,
                     actions,
                 }: {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <div className="card bg-base-100 border border-base-300 shadow-none rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-base-300 bg-base-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-base-content">{title}</h2>
                        {subtitle && <p className="text-xs text-base-content/50 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {actions}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function Toast({ message }: { message: string }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-base-content text-base-100 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-bottom-4">
            {message}
        </div>
    );
}

function AgencyAvatar({ name }: { name: string }) {
    return (
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0 select-none">
            {(name?.[0] ?? "?").toUpperCase()}
        </div>
    );
}

function UserAvatar({ firstname, lastname }: { firstname: string; lastname: string }) {
    return (
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-[10px] shrink-0 select-none">
            {(firstname?.[0] ?? "").toUpperCase()}
            {(lastname?.[0] ?? "").toUpperCase()}
        </div>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const styles: Record<UserRole, string> = {
        [UserRole.ADMIN]: "bg-purple-100 text-purple-700 border-purple-200",
        [UserRole.PUBLIC]: "bg-blue-100 text-blue-700 border-blue-200",
        [UserRole.SUPER_ADMIN]: "bg-green-100 text-green-700 border-green-200",
    };
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles[role]}`}>
            {role}
        </span>
    );
}

function CreateAgencyModal({
                                onClose,
                                onCreated,
                                apiUrl,
                            }: {
    onClose: () => void;
    onCreated: (agency: Agency) => void;
    apiUrl: string;
}) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Le nom de l'entreprise est requis.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${apiUrl}/agency`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const msg = err?.message
                    ? Array.isArray(err.message) ? err.message.join(", ") : err.message
                    : `Erreur ${res.status}`;
                setError(msg);
                return;
            }
            const created = await res.json();
            onCreated(created);
            onClose();
        } catch (e: any) {
            setError(e?.message || "Erreur réseau");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-base-100 rounded-xl border border-base-300 shadow-xl w-full max-w-sm mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <Plus size={14} />
                        </div>
                        <h3 className="text-sm font-bold text-base-content">Nouvelle entreprise</h3>
                    </div>
                    <button onClick={onClose} className="btn btn-xs btn-ghost text-base-content/40">
                        <X size={14} />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                            Nom de l'entreprise
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input input-sm border border-base-300 bg-base-100 text-sm w-full"
                            placeholder="Épilogue Studio"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-error flex items-center gap-1">
                            <AlertCircle size={12} /> {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 px-5 pb-5">
                    <button onClick={onClose} className="btn btn-sm btn-ghost">Annuler</button>
                    <button onClick={handleCreate} disabled={saving} className="btn btn-sm btn-primary gap-2">
                        {saving ? <span className="loading loading-spinner loading-xs" /> : <Plus size={14} />}
                        Créer l'entreprise
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Agency row (expandable) ─────────────────────────────────────────────────
function AgencyRow({
                        agency,
                        apiUrl,
                        plans,
                        onRenamed,
                        onDeleted,
                    }: {
    agency: Agency;
    apiUrl: string;
    plans: SubscriptionPlan[];
    onRenamed: (id: string, name: string) => void;
    onDeleted: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [users, setUsers] = useState<AgencyUser[]>(agency.users ?? []);
    const [usersLoaded, setUsersLoaded] = useState(Boolean(agency.users));
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(agency.name);
    const [saving, setSaving] = useState(false);

    const [subscription, setSubscription] = useState<AgencySubscription | null>(null);
    const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
    const [loadingSubscription, setLoadingSubscription] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [assigning, setAssigning] = useState(false);

    const loadUsers = async () => {
        if (usersLoaded || loadingUsers) return;
        setLoadingUsers(true);
        try {
            const res = await fetch(`${apiUrl}/agency/${agency.id}/users`, {
                method: "GET",
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                const list: AgencyUser[] = Array.isArray(data) ? data : data?.users ?? data?.data ?? [];
                setUsers(list);
                setUsersLoaded(true);
            }
        } catch (e) {
            console.warn("Failed to fetch agency users", e);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadSubscription = async () => {
        if (subscriptionLoaded || loadingSubscription) return;
        setLoadingSubscription(true);
        try {
            const res = await fetch(`${apiUrl}/agency-subscriptions/agency/${agency.id}`, {
                method: "GET",
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json().catch(() => null);
                setSubscription(data ?? null);
                setSelectedPlanId(data?.subscriptionPlan?.id ?? "");
            }
            setSubscriptionLoaded(true);
        } catch (e) {
            console.warn("Failed to fetch agency subscription", e);
        } finally {
            setLoadingSubscription(false);
        }
    };

    const handleAssignPlan = async () => {
        if (!selectedPlanId) return;
        setAssigning(true);
        try {
            const res = await fetch(`${apiUrl}/agency-subscriptions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ agencyId: agency.id, subscriptionPlanId: selectedPlanId }),
            });
            if (res.ok) {
                const created = await res.json();
                setSubscription(created);
                Swal.fire({ title: "Plan assigné", icon: "success", timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire({ title: "Erreur", text: "L'assignation du plan a échoué.", icon: "error" });
            }
        } catch {
            Swal.fire({ title: "Erreur", text: "Erreur réseau.", icon: "error" });
        } finally {
            setAssigning(false);
        }
    };

    const handleToggle = () => {
        setExpanded((v) => !v);
        if (!expanded) {
            loadUsers();
            loadSubscription();
        }
    };

    const handleRename = async () => {
        if (!name.trim() || name === agency.name) {
            setEditing(false);
            setName(agency.name);
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${apiUrl}/agency/${agency.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                onRenamed(agency.id, name);
                setEditing(false);
            } else {
                setName(agency.name);
            }
        } catch {
            setName(agency.name);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Swal.fire({
            title: "Êtes-vous sûr ?",
            text: `Cette action supprimera définitivement « ${agency.name} » et tous ses utilisateurs.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer !",
            cancelButtonText: "Annuler",
        }).then((result) => {
            if (!result.isConfirmed) return;
            fetch(`${apiUrl}/agency/${agency.id}`, {
                method: "DELETE",
                credentials: "include",
            })
                .then((res) => {
                    if (res.ok) {
                        Swal.fire({ title: "Supprimée !", text: "L'entreprise a été supprimée.", icon: "success" });
                        onDeleted(agency.id);
                    } else {
                        Swal.fire({ title: "Erreur", text: "La suppression a échoué.", icon: "error" });
                    }
                })
                .catch(() => {
                    Swal.fire({ title: "Erreur", text: "Erreur réseau.", icon: "error" });
                });
        });
    };

    return (
        <div className="rounded-lg border border-base-200 bg-base-50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
                <AgencyAvatar name={agency.name} />

                {editing ? (
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input input-xs w-full border border-base-300 bg-base-100 text-sm"
                            autoFocus
                        />
                    </div>
                ) : (
                    <button
                        onClick={handleToggle}
                        className="flex-1 min-w-0 flex items-center gap-2 text-left"
                    >
                        <p className="text-sm font-medium text-base-content truncate">{agency.name}</p>
                        <ChevronDown
                            size={13}
                            className={`shrink-0 text-base-content/40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        />
                    </button>
                )}

                <div className="flex items-center gap-1.5 shrink-0 text-xs text-base-content/50">
                    <Users size={12} />
                    <span>{usersLoaded ? users.length : agency.userCount ?? "—"}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {editing ? (
                        <>
                            <button onClick={handleRename} disabled={saving} className="btn btn-xs btn-success">
                                {saving ? <span className="loading loading-spinner loading-xs" /> : <Check size={12} />}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setName(agency.name);
                                }}
                                className="btn btn-xs btn-ghost"
                            >
                                <X size={12} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setEditing(true)}
                                className="btn btn-xs btn-ghost text-base-content/40 hover:text-base-content/70"
                                title="Renommer"
                            >
                                <Pencil size={13} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-xs btn-ghost bg-red-300 text-base-content hover:text-base-content/70"
                                title="Supprimer"
                            >
                                <Trash size={13} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-base-200 px-4 py-3 bg-base-100 flex flex-col gap-4">
                    <div>
                        {loadingUsers ? (
                            <div className="flex justify-center py-4">
                                <span className="loading loading-spinner loading-sm text-base-content/30" />
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-xs text-base-content/40 py-2">Aucun utilisateur dans cette entreprise.</p>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {users.map((u) => (
                                    <div key={u.id} className="flex items-center gap-2.5 px-1 py-1">
                                        <UserAvatar firstname={u.firstname} lastname={u.lastname} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-base-content truncate">
                                                {u.firstname} {u.lastname}
                                            </p>
                                            <p className="text-[11px] text-base-content/50 truncate">{u.email}</p>
                                        </div>
                                        <RoleBadge role={u.role} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-base-200 pt-3">
                        <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-2">
                            Abonnement
                        </p>
                        {loadingSubscription ? (
                            <div className="flex justify-center py-2">
                                <span className="loading loading-spinner loading-sm text-base-content/30" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-base-content/50">
                                    Plan actuel : <strong className="text-base-content">{subscription?.subscriptionPlan?.name ?? "Aucun"}</strong>
                                </span>
                                <select
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                    className="select select-xs border border-base-300 bg-base-100 text-sm"
                                >
                                    <option value="">Choisir un plan</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAssignPlan}
                                    disabled={!selectedPlanId || assigning}
                                    className="btn btn-xs btn-primary gap-1.5"
                                >
                                    {assigning ? <span className="loading loading-spinner loading-xs" /> : <Check size={12} />}
                                    Assigner
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminAgenciesPage() {
    const { user, loading } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [agenciesLoading, setAgenciesLoading] = useState(false);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

    useEffect(() => {
        if (loading || !user || !isSuperAdmin) return;
        let mounted = true;

        const fetchAgencies = async () => {
            setAgenciesLoading(true);
            try {
                const res = await fetch(`${apiUrl}/agency`, {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    const list: Agency[] = Array.isArray(data) ? data : data?.agencies ?? data?.data ?? [];
                    if (mounted) setAgencies(list);
                }
            } catch (e) {
                console.warn("Failed to fetch agencies", e);
            } finally {
                if (mounted) setAgenciesLoading(false);
            }
        };

        fetchAgencies();

        fetch(`${apiUrl}/subscription-plans`, { credentials: "include" })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (mounted) setPlans(Array.isArray(data) ? data : data?.data ?? []);
            })
            .catch((e) => console.warn("Failed to fetch subscription plans", e));

        return () => {
            mounted = false;
        };
    }, [user, loading, isSuperAdmin, apiUrl]);

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

    // ── Garde d'accès : réservé aux super admins ──────────────────────────
    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 min-h-60 max-w-md mx-auto text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <ShieldAlert size={22} strokeWidth={1.8} />
                </div>
                <h1 className="text-lg font-bold text-base-content">Accès restreint</h1>
                <p className="text-sm text-base-content/50">
                    Cette page est réservée aux super administrateurs.
                </p>
            </div>
        );
    }

    const handleAgencyCreated = (agency: Agency) => {
        setAgencies((prev) => [...prev, agency]);
        showToast("Entreprise créée avec succès");
    };

    const handleAgencyRenamed = (id: string, name: string) => {
        setAgencies((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
        showToast("Entreprise renommée");
    };

    const handleAgencyDeleted = (id: string) => {
        setAgencies((prev) => prev.filter((a) => a.id !== id));
        showToast("Entreprise supprimée");
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-base-content">Gestion des entreprises</h1>
                <p className="text-sm text-base-content/50 mt-1">
                    Vue d'ensemble des entreprises et de leurs utilisateurs
                </p>
            </div>

            <Section
                title="Entreprises"
                subtitle="Toutes les entreprises enregistrées sur la plateforme"
                icon={<Building2 size={15} strokeWidth={1.8} />}
                actions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-xs btn-primary gap-1.5"
                    >
                        <Plus size={13} />
                        Nouvelle entreprise
                    </button>
                }
            >
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                        <Users size={13} />
                        <span>
                            {agenciesLoading
                                ? "Chargement…"
                                : `${agencies.length} entreprise${agencies.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {agenciesLoading ? (
                        <div className="flex justify-center py-6">
                            <span className="loading loading-spinner loading-sm text-base-content/30" />
                        </div>
                    ) : agencies.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-base-content/30">
                            <Building2 size={28} strokeWidth={1.2} />
                            <p className="text-xs">Aucune entreprise enregistrée</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {agencies.map((agency) => (
                                <AgencyRow
                                    key={agency.id}
                                    agency={agency}
                                    apiUrl={apiUrl}
                                    plans={plans}
                                    onRenamed={handleAgencyRenamed}
                                    onDeleted={handleAgencyDeleted}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {showCreateModal && (
                <CreateAgencyModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleAgencyCreated}
                    apiUrl={apiUrl}
                />
            )}

            {toast && <Toast message={toast} />}
        </div>
    );
}

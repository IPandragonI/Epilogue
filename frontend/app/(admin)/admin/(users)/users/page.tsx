"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Users,
    Building2,
    Search,
    Plus,
    X,
    Pencil,
    Trash,
    Check,
    Shield,
    ShieldAlert,
    AlertCircle,
    CheckCircle2,
    LogIn,
} from "lucide-react";
import { UserRole } from "@/app/types/types";
import { useAuth } from "@/app/hooks/useAuth";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────
interface Agency {
    id: string;
    name: string;
}

interface ManagedUser {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: UserRole;
    agency?: Agency | null;
}

const ROLE_OPTIONS: UserRole[] = [UserRole.PUBLIC, UserRole.ADMIN, UserRole.SUPER_ADMIN];

// ── Reused UI primitives (mêmes patterns que la page Paramètres) ───────────
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
            <CheckCircle2 size={15} className="text-green-400" />
            {message}
        </div>
    );
}

function Avatar({ firstname, lastname }: { firstname: string; lastname: string }) {
    return (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs shrink-0 select-none">
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
            <Shield size={10} strokeWidth={2} />
            {role}
        </span>
    );
}

function AgencyBadge({ agency }: { agency?: Agency | null }) {
    if (!agency) {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-base-300 text-base-content/40">
                Aucune agence
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-base-300 bg-base-100 text-base-content/70">
            <Building2 size={10} />
            {agency.name}
        </span>
    );
}

// ── Create User Modal ───────────────────────────────────────────────────────
function CreateUserModal({
                              onClose,
                              onCreated,
                              agencies,
                              lockedAgencyId,
                              apiUrl,
                          }: {
    onClose: () => void;
    onCreated: (user: ManagedUser) => void;
    agencies: Agency[];
    lockedAgencyId?: string;
    apiUrl: string;
}) {
    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        agencyId: lockedAgencyId ?? agencies[0]?.id ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!form.firstname || !form.lastname || !form.email || !form.password || !form.agencyId) {
            setError("Tous les champs sont requis, y compris l'agence.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${apiUrl}/agency/${form.agencyId}/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    firstname: form.firstname,
                    lastname: form.lastname,
                    email: form.email,
                    password: form.password,
                    agencyName: agencies.find((a) => a.id === form.agencyId)?.name ?? "",
                }),
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
            const agency = agencies.find((a) => a.id === form.agencyId) ?? null;
            onCreated({ ...created, agency: created.agency ?? agency, role: created.role ?? UserRole.PUBLIC });
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
                        <h3 className="text-sm font-bold text-base-content">Nouvel utilisateur</h3>
                    </div>
                    <button onClick={onClose} className="btn btn-xs btn-ghost text-base-content/40">
                        <X size={14} />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Prénom</label>
                            <input
                                type="text"
                                value={form.firstname}
                                onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                                className="input input-sm border border-base-300 bg-base-100 text-sm w-full"
                                placeholder="Jean"
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Nom</label>
                            <input
                                type="text"
                                value={form.lastname}
                                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                                className="input input-sm border border-base-300 bg-base-100 text-sm w-full"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="input input-sm border border-base-300 bg-base-100 text-sm w-full"
                            placeholder="jean.dupont@exemple.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Mot de passe</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="input input-sm border border-base-300 bg-base-100 text-sm w-full"
                            placeholder="••••••••"
                        />
                    </div>

                    {!lockedAgencyId && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Agence</label>
                            <select
                                value={form.agencyId}
                                onChange={(e) => setForm({ ...form, agencyId: e.target.value })}
                                className="select select-sm border border-base-300 bg-base-100 text-sm w-full"
                            >
                                <option value="" disabled>Sélectionner</option>
                                {agencies.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

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
                        Créer l'utilisateur
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── User Row (édition nom/prénom + agence + rôle inline) ───────────────────
function UserRow({
                      managedUser,
                      agencies,
                      onSave,
                      onDeleted,
                      isCurrentUser,
                      isSuperAdmin,
                      apiUrl,
                  }: {
    managedUser: ManagedUser;
    agencies: Agency[];
    onSave: (id: string, data: { firstname: string; lastname: string; agencyId: string; role: UserRole }) => Promise<void>;
    onDeleted: (id: string) => void;
    isCurrentUser: boolean;
    isSuperAdmin: boolean;
    apiUrl: string;
}) {
    const [editing, setEditing] = useState(false);
    const [firstname, setFirstname] = useState(managedUser.firstname);
    const [lastname, setLastname] = useState(managedUser.lastname);
    const [agencyId, setAgencyId] = useState(managedUser.agency?.id ?? "");
    const [role, setRole] = useState<UserRole>(managedUser.role);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(managedUser.id, { firstname, lastname, agencyId, role });
        setSaving(false);
        setEditing(false);
    };

    const handleCancel = () => {
        setFirstname(managedUser.firstname);
        setLastname(managedUser.lastname);
        setAgencyId(managedUser.agency?.id ?? "");
        setRole(managedUser.role);
        setEditing(false);
    };

    const handleDelete = () => {
        Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer !",
            cancelButtonText: "Annuler",
        }).then((result) => {
            if (!result.isConfirmed) return;
            fetch(`${apiUrl}/users/${managedUser.id}`, {
                method: "DELETE",
                credentials: "include",
            })
                .then((res) => {
                    if (res.ok) {
                        Swal.fire({ title: "Supprimé !", text: "L'utilisateur a été supprimé.", icon: "success" });
                        onDeleted(managedUser.id);
                    } else {
                        Swal.fire({ title: "Erreur", text: "La suppression a échoué.", icon: "error" });
                    }
                })
                .catch(() => {
                    Swal.fire({ title: "Erreur", text: "Erreur réseau.", icon: "error" });
                });
        });
    };

    const handleImpersonate = () => {
        Swal.fire({
            title: "Se connecter en tant que cet utilisateur ?",
            text: `Vous serez connecté en tant que ${managedUser.firstname} ${managedUser.lastname}. Vous devrez vous reconnecter manuellement pour revenir à votre compte.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Continuer",
            cancelButtonText: "Annuler",
        }).then((result) => {
            if (!result.isConfirmed) return;
            fetch(`${apiUrl}/auth/impersonate/${managedUser.id}`, {
                method: "POST",
                credentials: "include",
            }).then((res) => {
                if (res.ok) {
                    window.location.href = "/dashboard";
                } else {
                    Swal.fire({ title: "Erreur", text: "Impossible de se connecter en tant que cet utilisateur.", icon: "error" });
                }
            }).catch(() => {
                Swal.fire({ title: "Erreur", text: "Erreur réseau.", icon: "error" });
            });
        });
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-base-200 bg-base-50 hover:bg-base-100 transition-colors flex-wrap sm:flex-nowrap">
            <Avatar firstname={firstname} lastname={lastname} />

            {editing ? (
                <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
                    <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="input input-xs w-full sm:w-28 border border-base-300 bg-base-100 text-sm"
                        placeholder="Prénom"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="input input-xs w-full sm:w-28 border border-base-300 bg-base-100 text-sm"
                        placeholder="Nom"
                    />
                    {isSuperAdmin && (
                        <>
                            <select
                                value={agencyId}
                                onChange={(e) => setAgencyId(e.target.value)}
                                className="select select-xs w-fullborder border-base-300 bg-base-100 text-sm"
                            >
                                <option value="">Aucune agence</option>
                                {agencies.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="select select-xs w-full border border-base-300 bg-base-100 text-sm"
                            >
                                {ROLE_OPTIONS.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content truncate">
                        {managedUser.firstname} {managedUser.lastname}
                        {isCurrentUser && (
                            <span className="ml-2 text-xs font-normal text-base-content/40">(vous)</span>
                        )}
                    </p>
                    <p className="text-xs text-base-content/50 truncate">{managedUser.email}</p>
                </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
                {!editing && <AgencyBadge agency={managedUser.agency} />}
                {!editing && <RoleBadge role={managedUser.role} />}

                {editing ? (
                    <>
                        <button onClick={handleSave} disabled={saving} className="btn btn-xs btn-success gap-1">
                            {saving ? <span className="loading loading-spinner loading-xs" /> : <Check size={12} />}
                        </button>
                        <button onClick={handleCancel} className="btn btn-xs btn-ghost gap-1">
                            <X size={12} />
                        </button>
                    </>
                ) : (
                    <>
                        {isSuperAdmin && !isCurrentUser && (
                            <button
                                onClick={handleImpersonate}
                                className="btn btn-xs btn-ghost text-base-content/40 hover:text-base-content/70"
                                title="Se connecter en tant que"
                            >
                                <LogIn size={13} />
                            </button>
                        )}
                        <button
                            onClick={() => setEditing(true)}
                            className="btn btn-xs btn-ghost text-base-content/40 hover:text-base-content/70"
                            title="Modifier"
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
    );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const { user, loading } = useAuth();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const [agencyFilter, setAgencyFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    const isAgencyAdmin = user?.role === UserRole.ADMIN;
    const hasAccess = isSuperAdmin || isAgencyAdmin;

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (loading || !user || !hasAccess) return;
        let mounted = true;

        const fetchData = async () => {
            setUsersLoading(true);
            try {
                if (isSuperAdmin) {
                    const [agRes, usersRes] = await Promise.all([
                        fetch(`${apiUrl}/agency`, { method: "GET", credentials: "include" }),
                        fetch(`${apiUrl}/users`, { method: "GET", credentials: "include" }),
                    ]);

                    if (agRes.ok) {
                        const agData = await agRes.json();
                        const agList: Agency[] = Array.isArray(agData) ? agData : agData?.agencies ?? agData?.data ?? [];
                        if (mounted) setAgencies(agList);
                    }

                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        const usersList: ManagedUser[] = Array.isArray(usersData)
                            ? usersData
                            : usersData?.users ?? usersData?.data ?? [];
                        if (mounted) setUsers(usersList);
                    }
                } else if (user.agency?.id) {
                    // Regular agency admin: only see/manage their own agency's users
                    if (mounted) setAgencies([user.agency]);
                    const usersRes = await fetch(`${apiUrl}/agency/${user.agency.id}/users`, {
                        method: "GET",
                        credentials: "include",
                    });
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        const usersList: ManagedUser[] = Array.isArray(usersData)
                            ? usersData
                            : usersData?.users ?? usersData?.data ?? [];
                        if (mounted) setUsers(usersList.map((u) => ({ ...u, agency: u.agency ?? user.agency })));
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch users/agencies", e);
            } finally {
                if (mounted) setUsersLoading(false);
            }
        };

        fetchData();
        return () => {
            mounted = false;
        };
    }, [user, loading, hasAccess, isSuperAdmin, apiUrl]);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesAgency = agencyFilter === "all" || u.agency?.id === agencyFilter;
            const q = search.trim().toLowerCase();
            const matchesSearch =
                !q ||
                `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q);
            return matchesAgency && matchesSearch;
        });
    }, [users, agencyFilter, search]);

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

    const handleUserCreated = (newUser: ManagedUser) => {
        setUsers((prev) => [...prev, newUser]);
        showToast("Utilisateur créé avec succès");
    };

    const handleUpdateUser = async (
        userId: string,
        data: { firstname: string; lastname: string; agencyId: string; role: UserRole }
    ) => {
        const payload: Record<string, unknown> = {
            firstname: data.firstname,
            lastname: data.lastname,
            agencyId: data.agencyId || null,
            role: data.role,
        };

        try {
            const res = await fetch(`${apiUrl}/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const message = err?.message
                    ? Array.isArray(err.message) ? err.message.join(", ") : err.message
                    : `Erreur ${res.status}`;
                showToast(message);
                return;
            }

            const newAgency = agencies.find((a) => a.id === data.agencyId) ?? null;
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, firstname: data.firstname, lastname: data.lastname, agency: newAgency, role: data.role }
                        : u
                )
            );
            showToast("Utilisateur mis à jour");
        } catch (err: any) {
            showToast(err?.message || "Erreur réseau");
        }
    };

    const handleUserDeleted = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast("Utilisateur supprimé");
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-base-content">Gestion des utilisateurs</h1>
                <p className="text-sm text-base-content/50 mt-1">
                    {isSuperAdmin
                        ? "Retrouvez, filtrez et gérez tous les utilisateurs de la plateforme"
                        : "Gérez les membres de votre agence"}
                </p>
            </div>

            <Section
                title="Utilisateurs"
                subtitle={isSuperAdmin ? "Tous les comptes, toutes agences confondues" : (agencies[0]?.name ?? "Votre agence")}
                icon={<Users size={15} strokeWidth={1.8} />}
                actions={
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-xs btn-primary gap-1.5"
                        disabled={agencies.length === 0}
                        title={agencies.length === 0 ? "Créez d'abord une agence" : undefined}
                    >
                        <Plus size={13} />
                        Nouvel utilisateur
                    </button>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par nom ou email…"
                                className="input input-sm w-full pl-8 border border-base-300 bg-base-100 text-sm"
                            />
                        </div>
                        {isSuperAdmin && (
                            <div className="relative sm:w-56">
                                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none z-10" />
                                <select
                                    value={agencyFilter}
                                    onChange={(e) => setAgencyFilter(e.target.value)}
                                    className="select select-sm w-full pl-8 border border-base-300 bg-base-100 text-sm"
                                >
                                    <option value="all">Toutes les agences</option>
                                    {agencies.map((a) => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                        <Users size={13} />
                        <span>
                            {usersLoading
                                ? "Chargement…"
                                : `${filteredUsers.length} utilisateur${filteredUsers.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {/* Users list */}
                    {usersLoading ? (
                        <div className="flex justify-center py-6">
                            <span className="loading loading-spinner loading-sm text-base-content/30" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-base-content/30">
                            <Users size={28} strokeWidth={1.2} />
                            <p className="text-xs">Aucun utilisateur ne correspond à ces critères</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filteredUsers.map((managedUser) => (
                                <UserRow
                                    key={managedUser.id}
                                    managedUser={managedUser}
                                    agencies={agencies}
                                    onSave={handleUpdateUser}
                                    onDeleted={handleUserDeleted}
                                    isCurrentUser={managedUser.id === user.id}
                                    isSuperAdmin={isSuperAdmin}
                                    apiUrl={apiUrl}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleUserCreated}
                    agencies={agencies}
                    lockedAgencyId={isSuperAdmin ? undefined : user.agency?.id}
                    apiUrl={apiUrl}
                />
            )}

            {toast && <Toast message={toast} />}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Shield,
  Link,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Building2,
  Users,
  Pencil,
  Plus,
  X,
  Check,
  Trash,
  ImageIcon,
} from "lucide-react";
import UserAvatar from "@/app/components/app/UserAvatar";
import { UserRole } from "@/app/types/types";
import { useAuth } from "@/app/hooks/useAuth";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProfileForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl: string;
}

interface NotionForm {
  notionKey: string;
  notionParentPageId: string;
}

interface SavedExists {
  firstname: boolean;
  lastname: boolean;
  email: boolean;
  notionKey: boolean;
  databaseUrl: boolean;
  workspaceUrl: boolean;
}

interface AgencyUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

// ── Initial data ───────────────────────────────────────────────────────────
const INITIAL_PROFILE: ProfileForm = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  role: UserRole.PUBLIC,
  avatarUrl: "",
};

const INITIAL_NOTION: NotionForm = {
  notionKey: "",
  notionParentPageId: "",
};

const INITIAL_EXISTS: SavedExists = {
  firstname: false,
  lastname: false,
  email: false,
  notionKey: false,
  databaseUrl: false,
  workspaceUrl: false,
};

// ── Field status indicator ─────────────────────────────────────────────────
function FieldStatus({ exists }: { exists: boolean }) {
  if (exists) {
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle2 size={12} strokeWidth={2.5} />
                Enregistré
            </span>
    );
  }
  return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
            <AlertCircle size={12} strokeWidth={2.5} />
            Non renseigné
        </span>
  );
}

// ── Role badge ─────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    [UserRole.ADMIN]: "bg-purple-100 text-purple-700 border-purple-200",
    [UserRole.PUBLIC]: "bg-blue-100 text-blue-700 border-blue-200",
    [UserRole.SUPER_ADMIN]: "bg-green-100 text-green-700 border-green-200",
  };
  return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[role]}`}>
            <Shield size={11} strokeWidth={2} />
        {role}
        </span>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({
                   title,
                   subtitle,
                   icon,
                   children,
                 }: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
      <div className="card bg-base-100 border border-base-300 shadow-none rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-base-300 bg-base-50">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-bold text-base-content">{title}</h2>
            {subtitle && <p className="text-xs text-base-content/50 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────────
function Field({
                 label,
                 hint,
                 exists,
                 children,
               }: {
  label: string;
  hint?: string;
  exists?: boolean;
  children: React.ReactNode;
}) {
  return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
            {label}
          </label>
          {exists !== undefined && <FieldStatus exists={exists} />}
        </div>
        {children}
        {hint && <p className="text-xs text-base-content/40">{hint}</p>}
      </div>
  );
}

// Colored border input wrapper
function InputWrap({ exists, children }: { exists?: boolean; children: React.ReactNode }) {
  const border =
      exists === undefined
          ? "border-base-300"
          : exists
              ? "border-green-300 focus-within:border-green-400"
              : "border-amber-300 focus-within:border-amber-400";
  return (
      <div className={`relative rounded-lg border ${border} bg-base-100 transition-colors`}>
        {children}
      </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message }: { message: string }) {
  return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-base-content text-base-100 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-bottom-4">
        <CheckCircle2 size={15} className="text-green-400" />
        {message}
      </div>
  );
}

function AgencyUserRow({
                         agencyUser,
                         onSave,
                         isCurrentUser,
                       }: {
  agencyUser: AgencyUser;
  onSave: (id: string, data: { firstname: string; lastname: string }) => Promise<void>;
  isCurrentUser: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [firstname, setFirstname] = useState(agencyUser.firstname);
  const [lastname, setLastname] = useState(agencyUser.lastname);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    await onSave(agencyUser.id, { firstname, lastname });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setFirstname(agencyUser.firstname);
    setLastname(agencyUser.lastname);
    setEditing(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "Cette action est irréversible.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Oui, supprimer !",
        cancelButtonText: "Annuler"
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
            method: "DELETE",
            credentials: "include"
          }).then((res) => {
            if (res.ok) {
              Swal.fire({
                title: "Supprimé !",
                text: "La ressource a été supprimée.",
                icon: "success"
              }).then(() => {
                window.location.reload();
              });
            } else {
              Swal.fire({
                title: "Erreur",
                text: "La ressource n'a pas pu être supprimée.",
                icon: "error"
              });
            }
          }).catch(() => {
            Swal.fire({
              title: "Erreur",
              text: "La ressource n'a pas pu être supprimée.",
              icon: "error"
            });
          });
        }
      });
    } catch (err: any) {
      showToast(err?.message || 'Erreur réseau');
    }
  }

  return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-base-200 bg-base-50 hover:bg-base-100 transition-colors">
        <UserAvatar
            avatarUrl={agencyUser.avatarUrl}
            firstname={agencyUser.firstname}
            lastname={agencyUser.lastname}
            size={32}
        />

        {editing ? (
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="input input-xs w-full border border-base-300 bg-base-100 text-sm"
                  placeholder="Prénom"
                  autoFocus
              />
              <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="input input-xs w-full border border-base-300 bg-base-100 text-sm"
                  placeholder="Nom"
              />
            </div>
        ) : (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-base-content truncate">
                {agencyUser.firstname} {agencyUser.lastname}
                {isCurrentUser && (
                    <span className="ml-2 text-xs font-normal text-base-content/40">(vous)</span>
                )}
              </p>
              <p className="text-xs text-base-content/50 truncate">{agencyUser.email}</p>
            </div>
        )}
        {agencyUser.role !== UserRole.ADMIN ?
            <div className="flex items-center gap-2 shrink-0">
              <RoleBadge role={agencyUser.role} />

              {editing ? (
                  <>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-xs btn-success gap-1"
                    >
                      {saving ? (
                          <span className="loading loading-spinner loading-xs" />
                      ) : (
                          <Check size={12} />
                      )}
                    </button>
                    <button onClick={handleCancel} className="btn btn-xs btn-ghost gap-1">
                      <X size={12} />
                    </button>
                  </>
              ) : (
                  <>
                    <button
                        onClick={() => setEditing(true)}
                        className="btn btn-xs btn-ghost text-base-content/40 hover:text-base-content/70"
                        title="Modifier"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                        onClick={() => handleDeleteUser(agencyUser.id)}
                        className="btn btn-xs btn-ghost bg-red-300 text-base-content hover:text-base-content/70"
                        title="Modifier"
                    >
                      <Trash size={13} />
                    </button>
                  </>
              )}
            </div> : null }
      </div>
  );
}

// ── Create User Modal ──────────────────────────────────────────────────────
function CreateUserModal({
                           onClose,
                           onCreated,
                           agencyId,
                           apiUrl,
                         }: {
  onClose: () => void;
  onCreated: (user: AgencyUser) => void;
  agencyId: string;
  apiUrl: string;
}) {
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.firstname || !form.lastname || !form.email || !form.password) {
      setError("Tous les champs sont requis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/agency/${agencyId}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
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
          {/* Header */}
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

          {/* Body */}
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

            {error && (
                <p className="text-xs text-error flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </p>
            )}
          </div>

          {/* Footer */}
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileForm>(INITIAL_PROFILE);
  const [notion, setNotion] = useState<NotionForm>(INITIAL_NOTION);
  const [exists, setExists] = useState<SavedExists>(INITIAL_EXISTS);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { user, loading } = useAuth();

  const [savedProfileSnapshot, setSavedProfileSnapshot] = useState<string>(JSON.stringify(INITIAL_PROFILE));
  const [savedNotionSnapshot, setSavedNotionSnapshot] = useState<string>(JSON.stringify(INITIAL_NOTION));

  // Agency state
  const [agencyName, setAgencyName] = useState<string>("");
  const [agencyUsers, setAgencyUsers] = useState<AgencyUser[]>([]);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let mounted = true;
    const initialProfileSnapshot = JSON.stringify(INITIAL_PROFILE);
    const initialNotionSnapshot = JSON.stringify(INITIAL_NOTION);

    const initFromServer = async () => {
      let serverUser: any = user;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401 || res.status === 403) {
          console.warn('Not authorized to fetch full user:', res.status);
        } else if (res.ok) {
          try {
            const parsed = await res.json();
            let payload: any = parsed;
            if (payload && typeof payload === 'object') {
              if (payload.user) payload = payload.user;
              else if (payload.data) payload = payload.data.user ?? payload.data;
            }
            if (payload && (payload.id || payload.email || payload.firstname)) {
              serverUser = payload;
            }
          } catch (err) {
            console.warn('Failed to parse user response as JSON; using useAuth user', err);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch user from API, falling back to useAuth user', err);
      }

      const mappedProfile: ProfileForm = {
        firstname: serverUser?.firstname ?? "",
        lastname: serverUser?.lastname ?? "",
        email: serverUser?.email ?? "",
        password: "",
        role: (serverUser?.role as UserRole) ?? UserRole.PUBLIC,
        avatarUrl: serverUser?.avatarUrl ?? "",
      };

      const notionToken = serverUser?.agency?.notionToken ?? serverUser?.agency?.notion_token ?? serverUser?.notionToken ?? serverUser?.notion_token ?? '';
      const notionParentPageId = serverUser?.agency?.notionParentPageId ?? '';

      const mappedNotion: NotionForm = {
        notionKey: notionToken,
        notionParentPageId,
      };

      const mappedExists: SavedExists = {
        firstname: Boolean(serverUser?.firstname),
        lastname: Boolean(serverUser?.lastname),
        email: Boolean(serverUser?.email),
        notionKey: Boolean(notionToken),
        databaseUrl: Boolean(notionParentPageId),
        workspaceUrl: Boolean(serverUser?.notion?.workspaceUrl),
      };

      if (!mounted) return;

      if (savedProfileSnapshot === initialProfileSnapshot) {
        setTimeout(() => {
          setProfile(mappedProfile);
          setSavedProfileSnapshot(JSON.stringify(mappedProfile));
        }, 0);
      }

      if (savedNotionSnapshot === initialNotionSnapshot) {
        setTimeout(() => {
          setNotion(mappedNotion);
          setSavedNotionSnapshot(JSON.stringify(mappedNotion));
        }, 0);
      }

      setTimeout(() => setExists(mappedExists), 0);

      // Fetch agency users
      const agencyId = serverUser?.agency?.id ?? user?.agency?.id;
      const agencyDisplayName = serverUser?.agency?.name ?? user?.agency?.name ?? "";
      if (agencyId && mounted) {
        setAgencyName(agencyDisplayName);
        setAgencyLoading(true);
        try {
          const agRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agency/${agencyId}/users`, {
            method: "GET",
            credentials: "include",
          });
          if (agRes.ok) {
            const agData = await agRes.json();
            // Unwrap possible wrappers
            const users: AgencyUser[] = Array.isArray(agData)
                ? agData
                : agData?.users ?? agData?.data ?? [];
            if (mounted) setAgencyUsers(users);
          }
        } catch (e) {
          console.warn("Failed to fetch agency users", e);
        } finally {
          if (mounted) setAgencyLoading(false);
        }
      }
    };

    initFromServer();
    return () => { mounted = false; };
  }, [user, loading, savedProfileSnapshot, savedNotionSnapshot]);

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

  const profileDirty = JSON.stringify(profile) !== savedProfileSnapshot;
  const notionDirty = JSON.stringify(notion) !== savedNotionSnapshot;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileDirty) return;
    const payload: Partial<ProfileForm> = {
      firstname: profile.firstname,
      lastname: profile.lastname,
      email: profile.email,
    };
    if (profile.password) (payload as any).password = profile.password;
    if (profile.avatarUrl !== undefined) (payload as any).avatarUrl = profile.avatarUrl || null;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.message ? (Array.isArray(err.message) ? err.message.join(', ') : err.message) : `Erreur ${res.status}`;
        showToast(message);
        return;
      }

      setSavedProfileSnapshot(JSON.stringify(profile));
      setExists((prev) => ({
        ...prev,
        firstname: Boolean(profile.firstname),
        lastname: Boolean(profile.lastname),
        email: Boolean(profile.email),
      }));
      setProfile((p) => ({ ...p, password: '' }));
      showToast('Profil mis à jour avec succès');
    } catch (err: any) {
      showToast(err?.message || 'Erreur réseau');
    }
  };

  const handleSaveNotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notionDirty) return;

    const payload = {
      notionToken: notion.notionKey,
      notionParentPageId: notion.notionParentPageId,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agency/${user.agency.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.message ? (Array.isArray(err.message) ? err.message.join(', ') : err.message) : `Erreur ${res.status}`;
        showToast(message);
        return;
      }

      setSavedNotionSnapshot(JSON.stringify(notion));
      setExists((prev) => ({
        ...prev,
        notionKey: Boolean(notion.notionKey),
        databaseUrl: Boolean(notion.notionParentPageId),
      }));
      showToast('Connexion Notion enregistrée');
    } catch (err: any) {
      showToast(err?.message || 'Erreur réseau');
    }
  };

  // ── Agency user update ─────────────────────────────────────────────────
  const handleUpdateAgencyUser = async (userId: string, data: { firstname: string; lastname: string }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err?.message ? (Array.isArray(err.message) ? err.message.join(', ') : err.message) : `Erreur ${res.status}`;
        showToast(message);
        return;
      }

      setAgencyUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
      );
      showToast('Utilisateur mis à jour');
    } catch (err: any) {
      showToast(err?.message || 'Erreur réseau');
    }
  };

  const handleUserCreated = (newUser: AgencyUser) => {
    setAgencyUsers((prev) => [...prev, newUser]);
    showToast('Utilisateur créé avec succès');
  };

  return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-base-content">Paramètres</h1>
          <p className="text-sm text-base-content/50 mt-1">
            Gérez votre profil et vos intégrations
          </p>
        </div>

        {/* ── Profile section ── */}
        <form onSubmit={handleSaveProfile}>
          <Section
              title="Profil"
              subtitle="Informations de votre compte"
              icon={<User size={15} strokeWidth={1.8} />}
          >
            <div className="flex flex-col gap-5">

              {/* Avatar + role */}
              <div className="flex items-center gap-4">
                <UserAvatar
                    avatarUrl={profile.avatarUrl}
                    firstname={profile.firstname}
                    lastname={profile.lastname}
                    size={56}
                />
                <div>
                  <p className="text-sm font-semibold text-base-content">
                    {profile.firstname} {profile.lastname}
                  </p>
                  <p className="text-xs text-base-content/50 mb-1">{profile.email}</p>
                  <RoleBadge role={profile.role} />
                </div>
              </div>

              <div className="divider my-0" />

              {/* First + last name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom" exists={exists.firstname}>
                  <InputWrap exists={exists.firstname}>
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                    <input
                        type="text"
                        value={profile.firstname}
                        onChange={(e) => setProfile({ ...profile, firstname: e.target.value })}
                        className="input input-sm w-full pl-8 text-sm border-none focus:outline-none bg-transparent"
                        placeholder="Prénom"
                    />
                  </InputWrap>
                </Field>
                <Field label="Nom" exists={exists.lastname}>
                  <InputWrap exists={exists.lastname}>
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                    <input
                        type="text"
                        value={profile.lastname}
                        onChange={(e) => setProfile({ ...profile, lastname: e.target.value })}
                        className="input input-sm w-full pl-8 text-sm border-none focus:outline-none bg-transparent"
                        placeholder="Nom"
                    />
                  </InputWrap>
                </Field>
              </div>

              {/* Email */}
              <Field label="Adresse email" exists={exists.email}>
                <InputWrap exists={exists.email}>
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                  <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="input input-sm w-full pl-8 text-sm border-none focus:outline-none bg-transparent"
                      placeholder="email@exemple.com"
                  />
                </InputWrap>
              </Field>

              <Field
                  label="Photo de profil"
                  hint="Collez l'URL d'une image (JPEG, PNG, WebP). Laissez vide pour afficher vos initiales."
              >
                <InputWrap>
                  <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                  <input
                      type="url"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      className="input input-sm w-full pl-8 text-sm border-none focus:outline-none bg-transparent"
                      placeholder="https://exemple.com/photo.jpg"
                  />
                </InputWrap>
              </Field>

              {/* Password */}
              <Field
                  label="Nouveau mot de passe"
                  hint="Laissez vide pour conserver le mot de passe actuel."
              >
                <InputWrap>
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                  <input
                      type={showPassword ? "text" : "password"}
                      value={profile.password}
                      onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                      className="input input-sm w-full pl-8 pr-10 text-sm border-none focus:outline-none bg-transparent"
                      placeholder="••••••••"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </InputWrap>
              </Field>

              <div className="flex justify-end pt-1">
                <button
                    type="submit"
                    disabled={!profileDirty}
                    className={`btn ${profileDirty ? "btn-primary" : "btn-neutral"} btn-sm gap-2 ${!profileDirty ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Save size={14} strokeWidth={2} />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </Section>
        </form>

        {/* ── Notion section ── */}
        <form onSubmit={handleSaveNotion}>
          <Section
              title="Intégration Notion"
              subtitle="Connectez votre espace de travail Notion"
              icon={<Link size={15} strokeWidth={1.8} />}
          >
            <div className="flex flex-col gap-5">

              {/* Notion banner */}
              <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-lg px-4 py-3">
                <svg width="20" height="20" viewBox="0 0 100 100" fill="none" className="shrink-0">
                  <rect width="100" height="100" rx="16" fill="#fff" />
                  <path d="M22 18.5c3.2 2.5 4.4 2.3 10.4 1.9l56.6-3.4c1.2 0 .2-1.2-.4-1.4L79.2 8.6c-2.2-1.7-5.2-3.6-10.8-3.2L14.3 9.2c-2.2.2-2.6 1.3-1.7 2.1L22 18.5z" fill="#000" />
                  <path d="M24.7 28.6V84c0 3 1.5 4.1 4.9 3.9l60.6-3.5c3.4-.2 4.3-2.1 4.3-4.8V24.5c0-2.7-1.1-4.1-3.5-3.9l-63 3.6c-2.6.2-3.3 1.5-3.3 4.4z" fill="#fff" />
                  <path d="M61 29.2L43.4 30.3c-1.2.1-1.5.7-1.5 1.6v2.2c0 .9.3 1.3 1.5 1.2l18-1.1v42.6l-18 1.1c-1.2.1-1.5.7-1.5 1.6v2c0 .9.3 1.3 1.5 1.2L61 81.5c1.5-.1 2-1 2-2.2V31.4c0-1.3-.5-2.3-2-2.2z" fill="#000" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-base-content">Notion API</p>
                  <p className="text-xs text-base-content/50 truncate">
                    Connectez-vous sur{" "}
                    <a
                        href="https://www.notion.so/my-integrations"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-base-content/80 transition-colors"
                    >
                      notion.so/my-integrations
                    </a>{" "}
                    pour obtenir votre clé API.
                  </p>
                </div>
                <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-base-content/30 hover:text-base-content/60 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* API Key */}
              <Field
                  label="Clé SECRET de votre intégration notion"
                  hint="Commence par « ntn_ ». Ne partagez jamais cette clé."
                  exists={exists.notionKey}
              >
                <InputWrap exists={exists.notionKey}>
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                  <input
                      disabled={user.role !== UserRole.ADMIN}
                      type={showApiKey ? "text" : "password"}
                      value={notion.notionKey}
                      onChange={(e) => setNotion({ ...notion, notionKey: e.target.value })}
                      className="input input-sm w-full pl-8 pr-10 text-sm font-mono border-none focus:outline-none bg-transparent"
                      placeholder="ntn_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60 transition-colors"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </InputWrap>
              </Field>

              {/* Parent page ID */}
              <Field
                  label="ID de la page parente Notion"
                  hint="Ouvrez votre page Notion → Partager → Copier le lien. L'ID est la suite de chiffres et lettres à la fin de l'URL (ex : 1a2b3c4d…). Pensez aussi à inviter votre intégration sur cette page."
                  exists={exists.databaseUrl}
              >
                <InputWrap exists={exists.databaseUrl}>
                  <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                  <input
                      disabled={user.role !== UserRole.ADMIN}
                      type="text"
                      value={notion.notionParentPageId}
                      onChange={(e) => setNotion({ ...notion, notionParentPageId: e.target.value })}
                      className="input input-sm w-full pl-8 text-sm font-mono border-none focus:outline-none bg-transparent"
                      placeholder="1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
                  />
                </InputWrap>
              </Field>

              <div className="flex justify-end pt-1">
                <button
                    type="submit"
                    disabled={!notionDirty}
                    className={`btn ${notionDirty ? "btn-primary" : "btn-neutral"} btn-sm gap-2 ${!notionDirty ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <Save size={14} strokeWidth={2} />
                  Enregistrer la connexion
                </button>
              </div>
            </div>
          </Section>
        </form>

        {/* ── Agency section ── */}
        <Section
            title={agencyName ? `Agence · ${agencyName}` : "Agence"}
            subtitle="Membres rattachés à votre agence"
            icon={<Building2 size={15} strokeWidth={1.8} />}
        >
          <div className="flex flex-col gap-4">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-base-content/50">
                <Users size={13} />
                <span>
                                {agencyLoading
                                    ? "Chargement…"
                                    : `${agencyUsers.length} utilisateur${agencyUsers.length !== 1 ? "s" : ""}`}
                            </span>
              </div>
              {user.role === UserRole.ADMIN && (
                  <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn btn-xs btn-primary gap-1.5"
                  >
                    <Plus size={13} />
                    Nouvel utilisateur
                  </button>
              )}
            </div>

            {/* Users list */}
            {agencyLoading ? (
                <div className="flex justify-center py-6">
                  <span className="loading loading-spinner loading-sm text-base-content/30" />
                </div>
            ) : agencyUsers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-base-content/30">
                  <Users size={28} strokeWidth={1.2} />
                  <p className="text-xs">Aucun utilisateur dans cette agence</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                  {agencyUsers.map((agencyUser) => (
                      <AgencyUserRow
                          key={agencyUser.id}
                          agencyUser={agencyUser}
                          onSave={handleUpdateAgencyUser}
                          isCurrentUser={agencyUser.id === user.id}
                      />
                  ))}
                </div>
            )}
          </div>
        </Section>

        {/* Create user modal */}
        {showCreateModal && (
            <CreateUserModal
                onClose={() => setShowCreateModal(false)}
                onCreated={handleUserCreated}
                agencyId={user.agency?.id}
                apiUrl={process.env.NEXT_PUBLIC_API_URL ?? ""}
            />
        )}

        {/* Toast notification */}
        {toast && <Toast message={toast} />}
      </div>
  );
}


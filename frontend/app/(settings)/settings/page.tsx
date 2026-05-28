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
} from "lucide-react";
import { UserRole } from "@/app/types/types";
import { useAuth } from "@/app/hooks/useAuth";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProfileForm {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: UserRole;
}

interface NotionForm {
    notionKey: string;
}

interface SavedExists {
    firstname: boolean;
    lastname: boolean;
    email: boolean;
    notionKey: boolean;
    databaseUrl: boolean;
    workspaceUrl: boolean;
}

// ── Initial data ───────────────────────────────────────────────────────────
const INITIAL_PROFILE: ProfileForm = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: UserRole.PUBLIC,
};

const INITIAL_NOTION: NotionForm = {
    notionKey: "",
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
    exists?: boolean; // undefined = no indicator (e.g. password)
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

                // If unauthorized or forbidden, bail out and keep `user` from useAuth
                if (res.status === 401 || res.status === 403) {
                    console.warn('Not authorized to fetch full user:', res.status);
                } else if (res.ok) {
                    // try to parse JSON body once
                    try {
                        const parsed = await res.json();
                        let payload: any = parsed;

                        // Unwrap common wrappers { user } or { data: { user } }
                        if (payload && typeof payload === 'object') {
                            if (payload.user) payload = payload.user;
                            else if (payload.data) payload = payload.data.user ?? payload.data;
                        }

                        // Basic heuristic to validate payload as user
                        if (payload && (payload.id || payload.email || payload.firstname)) {
                            serverUser = payload;
                        } else {
                            console.warn('Fetched payload does not look like a user, fallback to useAuth user', payload);
                        }
                    } catch (err) {
                        // body not JSON or parse failed — fallback to useAuth user
                        console.warn('Failed to parse user response as JSON; using useAuth user', err);
                    }
                } else {
                    console.warn('user endpoint responded with status', res.status);
                }
            } catch (err) {
                console.warn('Failed to fetch user from API, falling back to useAuth user', err);
            }

            // Normalize cloudSpace token keys and populate serverUser if missing values
            // serverUser remains the best available source (from API or useAuth)
            console.log('serverUser after fetch:', serverUser);

            const mappedProfile: ProfileForm = {
                firstname: serverUser?.firstname ?? "",
                lastname: serverUser?.lastname ?? "",
                email: serverUser?.email ?? "",
                password: "",
                role: (serverUser?.role as UserRole) ?? UserRole.PUBLIC,
            };

            const notionToken = serverUser?.cloudSpace?.notionToken ?? serverUser?.cloudSpace?.notion_token ?? serverUser?.notionToken ?? serverUser?.notion_token ?? '';

            const mappedNotion: NotionForm = {
                notionKey: notionToken,
            };

            const mappedExists: SavedExists = {
                firstname: Boolean(serverUser?.firstname),
                lastname: Boolean(serverUser?.lastname),
                email: Boolean(serverUser?.email),
                notionKey: Boolean(notionToken),
                databaseUrl: Boolean(serverUser?.notion?.databaseUrl),
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

            // Succès — mettre à jour les snapshots et les flags
            setSavedProfileSnapshot(JSON.stringify(profile));
            setExists((prev) => ({
                ...prev,
                firstname: Boolean(profile.firstname),
                lastname: Boolean(profile.lastname),
                email: Boolean(profile.email),
            }));
            // clear password locally after save
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
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/notion`, {
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

            // Succès — mettre à jour snapshot et flag
            setSavedNotionSnapshot(JSON.stringify(notion));
            setExists((prev) => ({ ...prev, notionKey: Boolean(notion.notionKey) }));
            showToast('Connexion Notion enregistrée');
        } catch (err: any) {
            showToast(err?.message || 'Erreur réseau');
        }
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
                            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg shrink-0 select-none">
                                {profile.firstname?.[0] ?? ""}{profile.lastname?.[0] ?? ""}
                            </div>
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

                        {/* Password — no indicator (never stored in clear) */}
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

            {/* Toast notification */}
            {toast && <Toast message={toast} />}
        </div>
    );
}

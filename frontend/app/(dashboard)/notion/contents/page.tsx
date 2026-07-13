"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Clock,
    ExternalLink,
    Zap,
    Shield,
    FileText,
} from "lucide-react";
import { Content, ContentStatus, PlatformConfig, Platform } from "@/app/types/types";
import { useAuth } from "@/app/hooks/useAuth";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type NotionStatus = "SYNCED" | "SYNCING" | "ERROR" | "NOT_SYNCED";

function getNotionStatus(c: Content): NotionStatus {
    if (!c.notion) return "NOT_SYNCED";
    return (c.notion.notionSyncStatus as NotionStatus) ?? "NOT_SYNCED";
}

const STATUS_CONFIG: Record<NotionStatus, { label: string; icon: React.ReactNode; badge: string }> = {
    SYNCED: {
        label: "Synchronisé",
        icon: <CheckCircle2 size={13} className="text-success" />,
        badge: "bg-success/10 text-success border-success/20",
    },
    SYNCING: {
        label: "En cours…",
        icon: <RefreshCw size={13} className="text-accent animate-spin" />,
        badge: "bg-accent/10 text-accent border-accent/20",
    },
    ERROR: {
        label: "Erreur",
        icon: <AlertCircle size={13} className="text-error" />,
        badge: "bg-error/10 text-error border-error/20",
    },
    NOT_SYNCED: {
        label: "Non synchronisé",
        icon: <Clock size={13} className="text-base-content/35" />,
        badge: "bg-base-200 text-base-content/50 border-base-300",
    },
};

const CONTENT_STATUS_BADGE: Record<ContentStatus, string> = {
    [ContentStatus.PUBLISHED]: "bg-success/10 text-success border-success/20",
    [ContentStatus.DRAFT]: "bg-base-200 text-base-content/60 border-base-300",
    [ContentStatus.WAITING_PUBLISH]: "bg-warning/10 text-warning border-warning/20",
    [ContentStatus.ARCHIVED]: "bg-base-300/40 text-base-content/50 border-base-300",
};

const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
    [ContentStatus.PUBLISHED]: "Publié",
    [ContentStatus.DRAFT]: "Brouillon",
    [ContentStatus.WAITING_PUBLISH]: "En attente",
    [ContentStatus.ARCHIVED]: "Archivé",
};

export default function NotionContentsPage() {
    const { user } = useAuth();
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<Record<string | number, boolean>>({});
    const [bulkSyncing, setBulkSyncing] = useState(false);
    const [autoSync, setAutoSync] = useState(false);
    const [autoSyncSaving, setAutoSyncSaving] = useState(false);
    const [filter, setFilter] = useState<NotionStatus | "ALL">("ALL");

    const agency = user?.agency;
    const hasToken = !!agency?.notionToken;
    const hasParentPage = !!agency?.notionParentPageId;
    const isConfigured = hasToken && hasParentPage;

    useEffect(() => {
        if (agency) {
            setAutoSync(!!agency.notionAutoSync);
        }
    }, [agency]);

    const load = useCallback(() => {
        setLoading(true);
        fetch(`${API_URL}/content/with-notion`, { credentials: "include" })
            .then((r) => r.json())
            .then((data) => setContents(Array.isArray(data) ? data : []))
            .catch(() => setContents([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const stats = useMemo(() => ({
        synced: contents.filter((c) => getNotionStatus(c) === "SYNCED").length,
        notSynced: contents.filter((c) => getNotionStatus(c) === "NOT_SYNCED").length,
        error: contents.filter((c) => getNotionStatus(c) === "ERROR").length,
        total: contents.length,
    }), [contents]);

    const filtered = useMemo(
        () => filter === "ALL" ? contents : contents.filter((c) => getNotionStatus(c) === filter),
        [contents, filter],
    );

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
    });

    const syncOne = useCallback(async (c: Content) => {
        setSyncing((s) => ({ ...s, [c.id]: true }));
        try {
            const res = await fetch(`${API_URL}/content-notion/sync/${c.id}`, {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    Array.isArray(err?.message) ? err.message.join(", ") : err?.message ?? "Erreur",
                );
            }
            const notion = await res.json();
            setContents((prev) =>
                prev.map((item) => (item.id === c.id ? { ...item, notion } : item)),
            );
            await Toast.fire({ icon: "success", title: "Synchronisé avec Notion" });
        } catch (e: any) {
            await Toast.fire({ icon: "error", title: e.message });
            setContents((prev) =>
                prev.map((item) =>
                    item.id === c.id
                        ? { ...item, notion: { ...item.notion, notionSyncStatus: "ERROR" } as any }
                        : item,
                ),
            );
        } finally {
            setSyncing((s) => ({ ...s, [c.id]: false }));
        }
    }, []);

    const syncAll = useCallback(async () => {
        const pending = contents.filter(
            (c) => getNotionStatus(c) === "NOT_SYNCED" || getNotionStatus(c) === "ERROR",
        );
        if (!pending.length) {
            await Toast.fire({ icon: "info", title: "Tout est déjà synchronisé" });
            return;
        }
        setBulkSyncing(true);
        for (const c of pending) {
            await syncOne(c);
        }
        setBulkSyncing(false);
    }, [contents, syncOne]);

    const toggleAutoSync = useCallback(async () => {
        if (!agency?.id) return;
        const next = !autoSync;
        setAutoSync(next);
        setAutoSyncSaving(true);
        try {
            await fetch(`${API_URL}/agency/${agency.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ notionAutoSync: next }),
            });
        } catch {
            setAutoSync(!next);
        } finally {
            setAutoSyncSaving(false);
        }
    }, [autoSync, agency]);

    const pendingCount = stats.notSynced + stats.error;

    return (
        <div className="flex flex-col gap-5 max-w-full">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">Stockage de contenus</h1>
                    <p className="text-sm text-base-content/50 mt-0.5">
                        Gérez la synchronisation de vos posts vers Notion
                    </p>
                </div>
                <button
                    onClick={syncAll}
                    disabled={bulkSyncing || !isConfigured || pendingCount === 0}
                    className="btn btn-accent btn-sm gap-2 rounded-full px-4 disabled:opacity-50"
                >
                    {bulkSyncing
                        ? <span className="loading loading-spinner loading-xs" />
                        : <RefreshCw size={14} />}
                    {bulkSyncing
                        ? "Synchronisation…"
                        : `Tout synchroniser${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
                </button>
            </div>

            {/* ── Stats ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total", value: stats.total, cls: "" },
                    { label: "Synchronisés", value: stats.synced, cls: "text-success" },
                    { label: "En attente", value: stats.notSynced, cls: "text-base-content/45" },
                    { label: "En erreur", value: stats.error, cls: "text-error" },
                ].map(({ label, value, cls }) => (
                    <div key={label} className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-4 gap-0.5">
                            <span className={`text-2xl font-bold tracking-tight ${cls}`}>{value}</span>
                            <span className="text-xs text-base-content/45">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Configuration card ────────────────────────────── */}
            <div className="card bg-base-100 border border-base-300 shadow-xs">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-base-300">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <Shield size={14} />
                    </div>
                    <h2 className="text-sm font-bold">Configuration Notion</h2>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Token status */}
                    <ConfigRow
                        label="Clé API"
                        ok={hasToken}
                        okText="Clé configurée"
                        errText="Clé manquante"
                        hint={
                            hasToken ? undefined : (
                                <Link href="/parameters" className="text-accent hover:underline">
                                    Configurer dans Paramètres →
                                </Link>
                            )
                        }
                    />

                    {/* Parent page */}
                    <ConfigRow
                        label="Page parente"
                        ok={hasParentPage}
                        okText="Page configurée"
                        errText="Page non configurée"
                        hint={
                            !hasParentPage ? (
                                <Link href="/parameters" className="text-accent hover:underline">
                                    Configurer dans Paramètres →
                                </Link>
                            ) : undefined
                        }
                    />

                    {/* Auto-sync toggle */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-base-content/45 uppercase tracking-wide">
                            Sync automatique
                        </span>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={autoSync ? "text-accent" : "text-base-content/30"} />
                                <span className="text-sm font-medium text-base-content/70">
                                    {autoSync ? "Activée" : "Désactivée"}
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-accent toggle-sm"
                                checked={autoSync}
                                disabled={autoSyncSaving || !isConfigured}
                                onChange={toggleAutoSync}
                                aria-label="Activer la synchronisation automatique"
                            />
                        </div>
                        <p className="text-xs text-base-content/40 leading-snug">
                            {autoSync
                                ? "Les posts publiés sont envoyés vers Notion."
                                : "Synchronisation manuelle uniquement."}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content table ─────────────────────────────────── */}
            <div className="card bg-base-100 border border-base-300 shadow-xs overflow-hidden">
                {/* Table header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-300 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <FileText size={15} className="text-base-content/40" />
                        <h2 className="text-sm font-bold">Contenus</h2>
                        <span className="badge badge-sm bg-base-200 text-base-content/50 border-0 font-medium">
                            {filtered.length}
                        </span>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1">
                        {(["ALL", "SYNCED", "NOT_SYNCED", "ERROR"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn btn-xs rounded-lg px-2.5 border-0 ${
                                    filter === f
                                        ? "bg-base-200 text-base-content font-semibold"
                                        : "btn-ghost text-base-content/50"
                                }`}
                            >
                                {f === "ALL" ? "Tous" :
                                    f === "SYNCED" ? "Synchronisés" :
                                        f === "NOT_SYNCED" ? "En attente" : "Erreurs"}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <span className="loading loading-spinner loading-md text-accent" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                        <CheckCircle2 size={28} className="text-base-content/20" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-base-content/50">
                            {filter === "ALL" ? "Aucun contenu trouvé" : "Aucun élément dans cette catégorie"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="border-base-200 text-base-content/45 text-xs uppercase tracking-wide">
                                    <th className="font-semibold pl-5 w-[40%]">Titre</th>
                                    <th className="font-semibold">Plateforme</th>
                                    <th className="font-semibold">Publication</th>
                                    <th className="font-semibold">Notion</th>
                                    <th className="font-semibold pr-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => {
                                    const notionSt = getNotionStatus(c);
                                    const stConfig = STATUS_CONFIG[notionSt];
                                    const platform = PlatformConfig[c.contentPlatform ?? Platform.BLOG];
                                    const isSyncing = syncing[c.id];

                                    return (
                                        <tr key={c.id} className="border-base-200 hover:bg-base-50 transition-colors">
                                            {/* Title */}
                                            <td className="pl-5 py-3 max-w-xs">
                                                <Link
                                                    href={`/content/posts/${c.id}`}
                                                    className="text-sm font-medium hover:underline underline-offset-2 line-clamp-1"
                                                >
                                                    {c.title}
                                                </Link>
                                            </td>

                                            {/* Platform */}
                                            <td className="py-3">
                                                <span className={`badge badge-sm font-medium border-0 ${platform.bg} ${platform.color}`}>
                                                    {platform.label}
                                                </span>
                                            </td>

                                            {/* Content status */}
                                            <td className="py-3">
                                                <span className={`badge badge-sm font-medium border ${CONTENT_STATUS_BADGE[c.status]}`}>
                                                    {CONTENT_STATUS_LABEL[c.status]}
                                                </span>
                                            </td>

                                            {/* Notion status */}
                                            <td className="py-3">
                                                <span className={`badge badge-sm font-medium border gap-1 ${stConfig.badge}`}>
                                                    {stConfig.icon}
                                                    {stConfig.label}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="py-3 pr-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {notionSt === "SYNCED" && c.notion?.notionPageId && (
                                                        <a
                                                            href={`https://www.notion.so/${c.notion.notionPageId.replace(/-/g, "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-xs btn-ghost gap-1 text-base-content/40 hover:text-accent"
                                                            title="Voir dans Notion"
                                                        >
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => syncOne(c)}
                                                        disabled={isSyncing || !isConfigured}
                                                        className="btn btn-xs btn-outline gap-1 rounded-lg disabled:opacity-40"
                                                        title={notionSt === "SYNCED" ? "Re-synchroniser" : "Synchroniser"}
                                                    >
                                                        {isSyncing
                                                            ? <span className="loading loading-spinner loading-xs" />
                                                            : <RefreshCw size={11} />}
                                                        {notionSt === "SYNCED" ? "Sync" : "Envoyer"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function ConfigRow({
    label,
    ok,
    okText,
    errText,
    hint,
}: {
    label: string;
    ok: boolean;
    okText: string;
    errText: string;
    hint?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-base-content/45 uppercase tracking-wide">
                {label}
            </span>
            <div className="flex items-center gap-2">
                {ok
                    ? <CheckCircle2 size={14} className="text-success shrink-0" />
                    : <AlertCircle size={14} className="text-warning shrink-0" />}
                <span className={`text-sm font-medium ${ok ? "text-base-content/70" : "text-base-content/50"}`}>
                    {ok ? okText : errText}
                </span>
            </div>
            {hint && <p className="text-xs">{hint}</p>}
        </div>
    );
}

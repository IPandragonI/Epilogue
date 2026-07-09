"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {useRouter, useParams, notFound} from "next/navigation";
import {RefreshCw, Pencil, Send, X, Save, Sparkles, Trash2, Download, Copy, Check, FileText, FileCode, ChevronDown, Globe, Clock, FileEdit} from "lucide-react";
import SeoScoreGauge from "@/app/components/content/SeoScoreGauge";
import TextEditor from "@/app/components/content/writing/TextEditor";
import {Content, PlatformConfig, Platform, StatusLabels, ContentStatus, NotionSyncStatus} from "@/app/types/types";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function htmlToPlainText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/h[1-6]>/gi, "\n\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<\/blockquote>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function htmlToMarkdown(html: string): string {
    return html
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, t) => `# ${t}\n\n`)
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, t) => `## ${t}\n\n`)
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, t) => `### ${t}\n\n`)
        .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) =>
            t.split("\n").map((l: string) => `> ${l}`).join("\n") + "\n\n"
        )
        .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, t) => `\`\`\`\n${t}\n\`\`\`\n\n`)
        .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, t) =>
            t.replace(/<li[^>]*>(.*?)<\/li>/gi, (_: string, i: string) => `- ${i}\n`) + "\n"
        )
        .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, t) => {
            let idx = 1;
            return t.replace(/<li[^>]*>(.*?)<\/li>/gi, (_: string, i: string) => `${idx++}. ${i}\n`) + "\n";
        })
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `${t}\n\n`)

        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, (_, t) => `**${t}**`)
        .replace(/<b[^>]*>(.*?)<\/b>/gi, (_, t) => `**${t}**`)
        .replace(/<em[^>]*>(.*?)<\/em>/gi, (_, t) => `*${t}*`)
        .replace(/<i[^>]*>(.*?)<\/i>/gi, (_, t) => `*${t}*`)
        .replace(/<s[^>]*>(.*?)<\/s>/gi, (_, t) => `~~${t}~~`)
        .replace(/<code[^>]*>(.*?)<\/code>/gi, (_, t) => `\`${t}\``)
        .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, (_, href, t) => `[${t}](${href})`)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<hr\s*\/?>/gi, "\n---\n\n")

        .replace(/<[^>]+>/g, "")

        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function downloadFile(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
}

function ExportMenu({ title, body }: { title: string; body: string }) {
    const [copied, setCopied] = useState(false);

    const plain = htmlToPlainText(body);
    const markdown = `# ${title}\n\n${htmlToMarkdown(body)}`;
    const filename = slugify(title) || "post";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(`${title}\n\n${plain}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-sm btn-outline gap-2 rounded-lg">
                <Download size={14} />
                Exporter
                <ChevronDown size={12} />
            </button>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 border border-base-300 rounded-xl shadow-lg z-50 w-52 p-1.5 mt-1 gap-0.5">
                <li>
                    <button onClick={handleCopy} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-base-200 transition-colors w-full text-left">
                        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-base-content/50" />}
                        <span>{copied ? "Copié !" : "Copier le texte"}</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => downloadFile(`${title}\n\n${plain}`, `${filename}.txt`, "text/plain;charset=utf-8")}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-base-200 transition-colors w-full text-left"
                    >
                        <FileText size={14} className="text-base-content/50" />
                        <span>Télécharger .txt</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => downloadFile(markdown, `${filename}.md`, "text/markdown;charset=utf-8")}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-base-200 transition-colors w-full text-left"
                    >
                        <FileCode size={14} className="text-base-content/50" />
                        <span>Télécharger .md</span>
                    </button>
                </li>
            </ul>
        </div>
    );
}

const STATUS_OPTIONS: { value: ContentStatus; label: string; icon: React.ReactNode; cls: string }[] = [
    {
        value: ContentStatus.DRAFT,
        label: "Brouillon",
        icon: <FileEdit size={13} />,
        cls: "text-base-content/60",
    },
    {
        value: ContentStatus.WAITING_PUBLISH,
        label: "En attente",
        icon: <Clock size={13} />,
        cls: "text-warning",
    },
    {
        value: ContentStatus.PUBLISHED,
        label: "Publié",
        icon: <Globe size={13} />,
        cls: "text-success",
    },
];

function StatusDropdown({ status, onChange }: { status: ContentStatus; onChange: (s: ContentStatus) => void }) {
    const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

    return (
        <div className="dropdown dropdown-end">
            <button
                tabIndex={0}
                className={`badge gap-1.5 text-xs font-medium border cursor-pointer select-none pr-2 h-auto py-1 ${
                    status === ContentStatus.PUBLISHED
                        ? "bg-success/10 text-success border-success/25"
                        : status === ContentStatus.WAITING_PUBLISH
                            ? "bg-warning/10 text-warning border-warning/25"
                            : "bg-base-200 text-base-content/60 border-base-300"
                }`}
            >
                <span className={current.cls}>{current.icon}</span>
                {current.label}
                <ChevronDown size={10} className="opacity-60" />
            </button>
            <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 border border-base-300 rounded-xl shadow-lg z-50 w-44 p-1 mt-1 gap-0.5"
            >
                {STATUS_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                        <button
                            onClick={() => onChange(opt.value)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
                                opt.value === status ? "bg-base-200 font-semibold" : "hover:bg-base-200"
                            }`}
                        >
                            <span className={opt.cls}>{opt.icon}</span>
                            {opt.label}
                            {opt.value === status && <Check size={12} className="ml-auto text-accent" />}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function parseReview(review?: string) {
    if (!review) return [];
    try {
        return JSON.parse(review) as { title: string; detail: string; ok: boolean }[];
    } catch {
        return [];
    }
}

function countWords(text: string) {
    if (!text) return 0;
    const plain = text.replace(/<[^>]*>/g, " ");
    return plain.trim().split(/\s+/).filter(Boolean).length;
}

export default function PostDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundError, setNotFoundError] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editedBody, setEditedBody] = useState("");
    const [editedTitle, setEditedTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [calculatingSeo, setCalculatingSeo] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [charCount, setCharCount] = useState(0);

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_URL}/content/${id}`, {
                    cache: "no-store",
                });

                if (!res.ok) {
                    setNotFoundError(true);
                    return;
                }

                const data: Content = await res.json();
                setContent(data);
            } catch (error) {
                console.error("Erreur lors de la récupération du contenu :", error);
                setNotFoundError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-lg text-accent"/>
            </div>
        );
    }

    if (notFoundError || !content) {
        notFound();
    }

    const currentPlatform = PlatformConfig[content.contentPlatform ?? Platform.BLOG];
    const isOverLimit = charCount > currentPlatform.maxLength;

    const body = isEditing ? editedBody : (content.body ?? "");

    const wordCount = countWords(body);
    const hasSeo = !!content.seo;
    const reviewItems = parseReview(content.seo?.review);
    const hasNotion = !!content.notion;

    const handleEdit = () => {
        setEditedTitle(content.title);
        setEditedBody(content.body ?? "");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedTitle(content.title);
        setEditedBody(content.body ?? "");
    };

    const handleSave = async () => {
        if (isOverLimit) {
            await Toast.fire({icon: "error", title: `Le contenu dépasse la limite de ${currentPlatform.maxLength.toLocaleString("fr-FR")} caractères pour ${currentPlatform.label}`});
            return;
        }

        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/content/${content.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    title: editedTitle,
                    body: editedBody,
                }),
            });

            if (!res.ok) {
                throw new Error();
            }

            setContent({...content, title: editedTitle, body: editedBody});
            setIsEditing(false);
            await Toast.fire({icon: "success", title: "Post mis à jour avec succès"});
            router.refresh();
        } catch {
            await Toast.fire({icon: "error", title: "Une erreur est survenue, veuillez réessayer"});
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Supprimer ce post ?",
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Supprimer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#DC2626",
        });

        if (!result.isConfirmed) return;

        try {
            setDeleting(true);

            const res = await fetch(`${API_URL}/content/${content.id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error();
            }

            await Toast.fire({icon: "success", title: "Post supprimé avec succès"});
            router.push("/content/posts");
        } catch {
            await Toast.fire({icon: "error", title: "Une erreur est survenue, veuillez réessayer"});
            setDeleting(false);
        }
    };

    const handleNotionAction = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_URL}/content-notion/sync/${content.id}`, {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const message = Array.isArray(err?.message)
                    ? err.message.join(", ")
                    : err?.message ?? "Erreur de synchronisation";
                throw new Error(message);
            }

            const notion = await res.json();
            setContent({ ...content, notion });
            await Toast.fire({
                icon: "success",
                title: hasNotion ? "Post synchronisé avec Notion" : "Post envoyé vers Notion",
            });
        } catch (e: any) {
            await Toast.fire({ icon: "error", title: e.message || "Erreur de synchronisation avec Notion" });
        } finally {
            setSyncing(false);
        }
    };

    const handleStatusChange = async (newStatus: ContentStatus) => {
        if (newStatus === content.status) return;
        try {
            const body: Record<string, unknown> = { status: newStatus };
            if (newStatus === ContentStatus.PUBLISHED && !content.publishedDate) {
                body.publishedDate = new Date().toISOString();
            }
            const res = await fetch(`${API_URL}/content/${content.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            setContent({ ...content, status: newStatus, publishedDate: body.publishedDate as string ?? content.publishedDate });
            await Toast.fire({ icon: "success", title: `Statut mis à jour : ${StatusLabels[newStatus]}` });
        } catch {
            await Toast.fire({ icon: "error", title: "Erreur lors du changement de statut" });
        }
    };

    const handleCalculateSeo = async () => {
        // TODO: Endpoint de calcul SEO
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-baseline gap-2 flex-wrap">
                <Link href="/content/posts" className="text-2xl font-bold font-display hover:underline underline-offset-2">
                    Mes posts
                </Link>
                <span className="text-2xl text-base-content/30">›</span>
                {isEditing ? (
                    <input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="input input-bordered input-sm text-base font-display w-4/6"
                    />
                ) : (
                    <h1 className="text-2xl font-display text-base-content/60 break-words">
                        {content.title}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="btn btn-sm btn-ghost gap-2 rounded-lg"
                        >
                            <X size={14}/>
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || isOverLimit}
                            className="btn btn-sm btn-accent gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <span className="loading loading-spinner loading-xs"/> : <Save size={14}/>}
                            {saving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        {isEditing && isOverLimit && (
                            <p className="text-xs text-error">
                                Le contenu dépasse la limite de {currentPlatform.maxLength.toLocaleString("fr-FR")} caractères pour {currentPlatform.label}.
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleEdit}
                            className="btn btn-sm btn-accent gap-2 rounded-lg"
                        >
                            <Pencil size={14}/>
                            Modifier
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn btn-sm btn-outline btn-error gap-2 rounded-lg"
                        >
                            {deleting ? <span className="loading loading-spinner loading-xs"/> : <Trash2 size={14}/>}
                            {deleting ? "Suppression..." : "Supprimer"}
                        </button>
                        <button
                            onClick={handleCalculateSeo}
                            disabled={calculatingSeo}
                            className="btn btn-sm btn-outline gap-2 rounded-lg"
                        >
                            {calculatingSeo ? <span className="loading loading-spinner loading-xs"/> : <Sparkles size={14}/>}
                            {calculatingSeo ? "Calcul en cours..." : "Calcul SEO"}
                        </button>
                        <button
                            onClick={handleNotionAction}
                            disabled={syncing}
                            className="btn btn-sm btn-outline gap-2 rounded-lg"
                        >
                            {syncing ? (
                                <span className="loading loading-spinner loading-xs"/>
                            ) : hasNotion ? (
                                <RefreshCw size={14}/>
                            ) : (
                                <Send size={14}/>
                            )}
                            {syncing
                                ? "Synchronisation..."
                                : hasNotion
                                    ? "Synchroniser avec Notion"
                                    : "Envoyer vers Notion"}
                        </button>
                        <ExportMenu title={content.title} body={content.body ?? ""} />
                    </>
                )}

                <span className={`badge gap-1.5 text-xs font-medium ${currentPlatform.bg} ${currentPlatform.color} border-none`}>
                    {currentPlatform.icon}
                    {currentPlatform.label}
                </span>

                <StatusDropdown status={content.status} onChange={handleStatusChange} />

                {content.status !== ContentStatus.PUBLISHED && (
                    <button
                        onClick={() => handleStatusChange(ContentStatus.PUBLISHED)}
                        className="btn btn-sm btn-primary gap-2 rounded-lg ml-1"
                    >
                        <Globe size={14} />
                        Publier
                    </button>
                )}
            </div>

            <div className="flex gap-5 flex-1 min-h-0">
                <div className="flex-1 card bg-base-100 border border-base-300 shadow-xs overflow-hidden flex flex-col">
                    {isEditing ? (
                        <div className="flex-1 flex flex-col p-4 overflow-hidden">
                            <TextEditor
                                content={editedBody}
                                onChange={setEditedBody}
                                maxChars={currentPlatform.maxLength}
                                onCharsChange={setCharCount}
                                placeholder="Modifiez votre contenu..."
                            />
                        </div>
                    ) : (
                        <>
                            <div className="card-body p-6 overflow-y-auto flex-1">
                                <h2 className="text-base font-bold mb-4">{content.title}</h2>
                                <div
                                    className={[
                                        "prose prose-sm max-w-none text-base-content",
                                        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:leading-tight",
                                        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:leading-tight",
                                        "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:leading-snug",
                                        "[&_strong]:font-bold [&_em]:italic",
                                        "[&_p]:mb-2 [&_p]:leading-relaxed",
                                        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
                                        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
                                        "[&_li]:mb-0.5 [&_li]:leading-relaxed",
                                        "[&_blockquote]:border-l-4 [&_blockquote]:border-base-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-base-content/60 [&_blockquote]:my-2",
                                        "[&_code]:bg-base-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
                                        "[&_a]:underline [&_a]:text-primary",
                                    ].join(" ")}
                                    dangerouslySetInnerHTML={{__html: body}}
                                />
                            </div>

                            <div className="flex items-center justify-between px-6 py-2.5 bg-base-content text-base-100 text-xs font-medium shrink-0">
                                <span>{wordCount} MOTS</span>
                                <span>Temps de lecture : {Math.ceil(wordCount / 200)} min</span>
                                <span className="flex items-center gap-1.5">
                                    <RefreshCw size={11}/>
                                    {content.notion
                                        ? (NotionSyncStatus[content.notion.notionSyncStatus as keyof typeof NotionSyncStatus] ?? content.notion.notionSyncStatus)
                                        : "Non lié à Notion"}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="w-72 shrink-0 flex flex-col gap-4">
                    <div className="card bg-base-100 border border-base-300 shadow-xs">
                        <div className="card-body p-5 gap-5">

                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base">Analyse SEO</h3>
                            </div>

                            {hasSeo ? (
                                <>
                                    <div className="flex justify-center">
                                        <SeoScoreGauge score={content.seo?.score ?? 0}/>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                                            Optimisation
                                        </p>
                                        {content.seo?.review ? (
                                            <p className="text-xs text-base-content/60 leading-relaxed">
                                                {content.seo.review}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-base-content/40">
                                                Aucune analyse détaillée disponible.
                                            </p>
                                        )}
                                    </div>

                                    <div className="divider my-0"/>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                                            Nuage de mots clés
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {content.seo?.keywords && content.seo.keywords.length > 0 ? (
                                                content.seo.keywords.split(",").map((word) => word.trim()).filter(Boolean).map((word) => (
                                                    <span key={word} className="badge badge-ghost text-xs">
                                                        {word}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-xs text-base-content/40">
                                                    Aucun mot clé disponible.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                                        <RefreshCw size={16} className="text-base-content/30"/>
                                    </div>
                                    <p className="text-sm font-medium text-base-content/60">
                                        Analyse SEO en attente
                                    </p>
                                    <p className="text-xs text-base-content/40">
                                        Le score SEO n&apos;a pas encore été calculé pour ce contenu.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
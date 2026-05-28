"use client";

import {useState} from "react";
import {Platform, PlatformType} from "@/app/types/types";

function toReadableText(html: string): string {
    return html
        .replace(/<\/?(h[1-6]|p|li|blockquote|ul|ol)[^>]*>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

const PROSE_CLASSES = [
    "prose prose-xs max-w-none text-base-content/80",
    "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:leading-tight",   // ← ajouter
    "[&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1.5 [&_h2]:mt-2 [&_h2]:leading-tight",
    "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:leading-snug",
    "[&_strong]:font-bold [&_em]:italic",
    "[&_p]:mb-1.5 [&_p]:leading-relaxed",
    "[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-1.5",
    "[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-1.5",
    "[&_li]:mb-0.5 [&_li]:leading-relaxed",
    "[&_blockquote]:border-l-4 [&_blockquote]:border-base-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-base-content/60 [&_blockquote]:my-1.5",
    "[&_code]:bg-base-200 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
    "[&_a]:underline [&_a]:text-primary",
    "[&>*:last-child]:mb-0",
].join(" ");

function PreviewLabel({label}: {label: string}) {
    return <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-3">{label}</p>;
}

function TwitterPreview({content}: {content: string}) {
    const plain     = toReadableText(content ?? "");
    const truncated = plain.slice(0, 280);
    const remaining = 280 - plain.length;
    const remainColor =
        remaining < 0   ? "text-error" :
            remaining < 20  ? "text-warning" :
                "text-base-content/30";

    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <PreviewLabel label="Twitter / X Preview"/>
            <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-base-300 shrink-0 flex items-center justify-center text-base-content/40 text-xs font-bold">
                    J
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="font-bold text-sm">Jean Marketer</span>
                        <span className="text-base-content/40 text-xs">@jean_seo · 2m</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap break-words">
                        {truncated || <span className="text-base-content/20 italic">Votre tweet apparaîtra ici…</span>}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-base-content/30 text-xs">
                            <span className="hover:text-blue-400 cursor-pointer transition-colors">💬 4</span>
                            <span className="hover:text-green-400 cursor-pointer transition-colors">🔁 12</span>
                            <span className="hover:text-red-400 cursor-pointer transition-colors">❤️ 48</span>
                        </div>
                        <span className={`text-xs font-medium tabular-nums ${remainColor}`}>
                          {remaining}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedinPreview({content}: {content: string}) {
    const [expanded, setExpanded] = useState(false);
    const safeContent = content ?? "";
    const hasContent = safeContent.trim().length > 0 && safeContent !== "<p></p>";

    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <PreviewLabel label="LinkedIn Preview"/>
            <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-blue-700 text-xs font-bold">JM</div>
                <div>
                    <p className="font-semibold text-sm leading-tight">Jean Marketer</p>
                    <p className="text-base-content/40 text-xs">Consultant SEO · 2h</p>
                </div>
            </div>
            <div
                className={`${PROSE_CLASSES} ${expanded ? "" : "line-clamp-6"}`}
                dangerouslySetInnerHTML={{__html: hasContent ? safeContent : ""}}
            />
            {hasContent && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="text-blue-600 text-xs mt-1.5 cursor-pointer hover:underline"
                >
                    {expanded ? "Voir moins" : "…voir plus"}
                </button>
            )}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-base-200 text-base-content/40 text-xs">
                <span className="hover:text-blue-500 cursor-pointer transition-colors">👍 J&apos;aime</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">💬 Commenter</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">↗ Partager</span>
            </div>
        </div>
    );
}

function InstagramPreview({content}: {content: string}) {
    const [expanded, setExpanded] = useState(false);
    const plain = toReadableText(content ?? "");

    return (
        <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden text-sm">
            <div className="px-4 pt-3">
                <PreviewLabel label="Instagram Preview"/>
            </div>
            <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 mx-4 rounded-lg h-28 flex items-center justify-center text-base-content/20 text-xs border border-base-200">
                Image / Story
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 shrink-0"/>
                        <span className="font-semibold text-xs">jean_seo</span>
                    </div>
                    <div className="flex gap-2 text-base-content/30 text-xs">
                        <span>❤️ 142</span>
                        <span>💬 18</span>
                    </div>
                </div>
                <p className={`text-xs leading-relaxed text-base-content/80 whitespace-pre-wrap break-words ${expanded ? "" : "line-clamp-4"}`}>
                    {plain || <span className="text-base-content/20 italic">Votre légende apparaîtra ici…</span>}
                </p>
                {plain.length > 0 && (
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="text-blue-500 text-xs mt-1 cursor-pointer hover:underline"
                    >
                        {expanded ? "Voir moins" : "…voir plus"}
                    </button>
                )}
            </div>
        </div>
    );
}

function BlogPreview({content}: {content: string}) {
    const [expanded, setExpanded] = useState(false);
    const hasContent = (content ?? "").trim().length > 0 && content !== "<p></p>";

    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <PreviewLabel label="Blog Preview"/>
            <div className="flex items-center gap-1.5 text-base-content/30 text-xs mb-3">
                <span>jean-marketer.com</span>
                <span>·</span>
                <span>5 min de lecture</span>
            </div>
            <div
                className={`${PROSE_CLASSES} ${expanded ? "" : "line-clamp-8"}`}
                dangerouslySetInnerHTML={{__html: hasContent ? content : ""}}
            />
            {hasContent && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="text-blue-600 text-xs mt-2 cursor-pointer hover:underline"
                >
                    {expanded ? "Lire moins" : "…lire la suite"}
                </button>
            )}
        </div>
    );
}

function Preview({platform, content}: {platform: PlatformType; content: string}) {
    if (platform === Platform.TWITTER) return <TwitterPreview content={content}/>;
    if (platform === Platform.LINKEDIN) return <LinkedinPreview content={content}/>;
    if (platform === Platform.INSTAGRAM) return <InstagramPreview content={content}/>;
    if (platform === Platform.BLOG) return <BlogPreview content={content}/>;
    return <LinkedinPreview content={content}/>;
}

export default Preview;
"use client";

import {Platform, PlatformType} from "@/app/types/types";

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function PreviewLabel({label}: {label: string}) {
    return <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-3">{label}</p>;
}

function TwitterPreview({content}: {content: string}) {
    const plain = stripHtml(content).trim();
    const truncated = plain.slice(0, 280);
    const remaining = 280 - plain.length;
    const remainColor = remaining < 0 ? "text-error" : remaining < 20 ? "text-warning" : "text-base-content/30";

    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <PreviewLabel label="Twitter / X Preview"/>
            <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-base-300 shrink-0 flex items-center justify-center text-base-content/40 text-xs font-bold">J</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="font-bold text-sm">Jean Marketer</span>
                        <span className="text-base-content/40 text-xs">@jean_seo · 2m</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap break-words">{truncated}</p>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-base-content/30 text-xs">
                            <span className="hover:text-blue-400 cursor-pointer transition-colors">💬 4</span>
                            <span className="hover:text-green-400 cursor-pointer transition-colors">🔁 12</span>
                            <span className="hover:text-red-400 cursor-pointer transition-colors">❤️ 48</span>
                        </div>
                        <span className={`text-xs font-medium ${remainColor}`}>{remaining}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedinPreview({content}: {content: string}) {
    const hasContent = content.trim().length > 0 && content !== "<p></p>";

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
                className="prose prose-xs max-w-none text-base-content/80 line-clamp-6 [&>*]:mb-1 [&>*:last-child]:mb-0"
                dangerouslySetInnerHTML={{__html: hasContent ? content : ''}}
            />
            <p className="text-blue-600 text-xs mt-1.5 cursor-pointer">…voir plus</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-base-200 text-base-content/40 text-xs">
                <span className="hover:text-blue-500 cursor-pointer transition-colors">👍 J&apos;aime</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">💬 Commenter</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">↗ Partager</span>
            </div>
        </div>
    );
}

function InstagramPreview({content}: {content: string}) {
    const plain = stripHtml(content).trim();

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
                <p className="text-xs leading-relaxed text-base-content/80 line-clamp-4 whitespace-pre-wrap">{plain}</p>
            </div>
        </div>
    );
}

function BlogPreview({content}: {content: string}) {
    const hasContent = content.trim().length > 0 && content !== "<p></p>";

    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <PreviewLabel label="Blog Preview"/>
            <div className="flex items-center gap-1.5 text-base-content/30 text-xs mb-3">
                <span>jean-marketer.com</span>
                <span>·</span>
                <span>5 min de lecture</span>
            </div>
            <div
                className="prose prose-xs max-w-none text-base-content/80 line-clamp-8 [&>h1]:text-base [&>h1]:font-bold [&>h2]:text-sm [&>h2]:font-bold [&>h3]:text-sm [&>h3]:font-semibold [&>*]:mb-1.5 [&>*:last-child]:mb-0"
                dangerouslySetInnerHTML={{__html: hasContent ? content : ''}}
            />
            <p className="text-blue-600 text-xs mt-2 cursor-pointer">…lire la suite</p>
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
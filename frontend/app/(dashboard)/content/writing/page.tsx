"use client";

import { useState, useRef } from "react";
import {
    Globe,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Bold,
    Italic,
    List,
    AlignLeft,
    Link2,
    Quote,
} from "lucide-react";

type Plateforme = "instagram-stories" | "instagram-post" | "linkedin" | "twitter";

type PlateformeConfig = {
    id: Plateforme;
    label: string;
    sub: string;
    icon: React.ReactNode;
    maxChars: number;
};

const PLATEFORMES: PlateformeConfig[] = [
    { id: "instagram-stories", label: "Instagram", sub: "Captions & Stories", icon: <Globe size={18} />, maxChars: 2200 },
    { id: "instagram-post",    label: "Instagram", sub: "Captions & Stories", icon: <Globe size={18} />, maxChars: 2200 },
    { id: "linkedin",          label: "LinkedIn",  sub: "Post Pro & Carousel", icon: <Globe size={18} />,  maxChars: 3000 },
    { id: "twitter",           label: "Twitter / X", sub: "Threads & Tweets", icon: <Globe size={18} />,   maxChars: 280  },
];

function ApercuTwitter({ content }: { content: string }) {
    const preview = content.trim() || "Voici comment le SEO va changer votre business.\n\nLe contenu IA n'est plus une option, c'est une nécessité.\n\n#SEO #MarketingDigital #IA";
    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-3">Twitter Preview</p>
            <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-base-300 shrink-0 flex items-center justify-center text-base-content/30 text-xs font-bold">J</div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="font-bold text-sm">Jean Marketer</span>
                        <span className="text-base-content/40 text-xs">@jean_seo · 2m</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-base-content/80">
                        {preview.slice(0, 280)}
                    </p>
                    <div className="flex items-center gap-5 mt-3 text-base-content/30">
                        <span className="flex items-center gap-1 text-xs hover:text-blue-400 cursor-pointer transition-colors">💬 4</span>
                        <span className="flex items-center gap-1 text-xs hover:text-green-400 cursor-pointer transition-colors">🔁 12</span>
                        <span className="flex items-center gap-1 text-xs hover:text-red-400 cursor-pointer transition-colors">❤️ 48</span>
                        <span className="flex items-center gap-1 text-xs hover:text-blue-400 cursor-pointer transition-colors">📊</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ApercuLinkedin({ content }: { content: string }) {
    const preview = content.trim() || "Voici 3 stratégies SEO qui fonctionnent vraiment en 2026.\n\nLe référencement a changé. Les anciennes méthodes ne suffisent plus...\n\n#SEO #LinkedIn #Marketing";
    return (
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-3">LinkedIn Preview</p>
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-blue-700 text-xs font-bold">JM</div>
                <div className="flex-1">
                    <p className="font-semibold text-sm">Jean Marketer</p>
                    <p className="text-base-content/40 text-xs">Consultant SEO · 2h</p>
                </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-base-content/80 line-clamp-6">
                {preview.slice(0, 3000)}
            </p>
            <p className="text-blue-600 text-xs mt-1 cursor-pointer">…voir plus</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-base-200 text-base-content/40 text-xs">
                <span className="hover:text-blue-500 cursor-pointer">👍 Jaime</span>
                <span className="hover:text-blue-500 cursor-pointer">💬 Commenter</span>
                <span className="hover:text-blue-500 cursor-pointer">↗ Partager</span>
            </div>
        </div>
    );
}

function ApercuInstagram({ content }: { content: string }) {
    const preview = content.trim() || "✨ Le SEO en 2026, c'est quoi ?\n\nSpoiler : ce n'est plus juste des mots-clés. C'est une expérience complète.\n\n#SEO #Instagram #Contenu";
    return (
        <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden text-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 px-4 pt-3 mb-2">Instagram Preview</p>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 mx-4 rounded-lg h-32 flex items-center justify-center text-base-content/20 text-xs">
                Image / Story
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 shrink-0" />
                    <span className="font-semibold text-xs">jean_seo</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-line text-base-content/80 line-clamp-4">
                    {preview}
                </p>
                <div className="flex gap-3 mt-2 text-base-content/30 text-xs">
                    <span>❤️ 142</span>
                    <span>💬 18</span>
                </div>
            </div>
        </div>
    );
}

function Apercu({ plateforme, content }: { plateforme: Plateforme; content: string }) {
    if (plateforme === "twitter") return <ApercuTwitter content={content} />;
    if (plateforme === "linkedin") return <ApercuLinkedin content={content} />;
    return <ApercuInstagram content={content} />;
}

function EditorToolbar() {
    return (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-base-300 flex-wrap">
            {[
                { icon: <Bold size={13} />, title: "Gras" },
                { icon: <Italic size={13} />, title: "Italique" },
                { icon: <List size={13} />, title: "Liste" },
                { icon: <AlignLeft size={13} />, title: "Alignement" },
                { icon: <Link2 size={13} />, title: "Lien" },
                { icon: <Quote size={13} />, title: "Citation" },
            ].map((tool) => (
                <button
                    key={tool.title}
                    title={tool.title}
                    className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-base-content"
                >
                    {tool.icon}
                </button>
            ))}
            <div className="w-px h-4 bg-base-300 mx-1" />
            <select className="select select-ghost select-xs text-xs text-base-content/40 h-7 min-h-0 pr-6">
                <option>Styles</option>
                <option>Titre H1</option>
                <option>Titre H2</option>
                <option>Normal</option>
            </select>
        </div>
    );
}

export default function RedactionPage() {
    const [plateforme, setPlateforme] = useState<Plateforme>("twitter");
    const [content, setContent] = useState("");
    const [prompt, setPrompt] = useState("");
    const [ton, setTon] = useState("professionnel");
    const [longueur, setLongueur] = useState("moyen");
    const [generating, setGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const currentPlateforme = PLATEFORMES.find((p) => p.id === plateforme)!;
    const charCount = content.length;
    const charPercent = Math.min((charCount / currentPlateforme.maxChars) * 100, 100);
    const charColor = charPercent > 90 ? "text-error" : charPercent > 70 ? "text-warning" : "text-base-content/40";

    const handleGenerer = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        await new Promise((r) => setTimeout(r, 1600));
        const mockContent: Record<Plateforme, string> = {
            twitter: `🚀 Le SEO en 2026, ça ressemble à quoi ?\n\nSpoiler : les vieilles recettes ne marchent plus.\n\nVoici ce qui fonctionne vraiment maintenant :\n\n→ Contenu expert et dense\n→ Expérience utilisateur au cœur\n→ Être cité par les IA génératives\n\nLe trafic organique classique baisse. Mais pour ceux qui s'adaptent, l'opportunité est immense.\n\n#SEO #MarketingDigital #IA [Thread]`,
            linkedin: `Le SEO en 2026 : ce qui a vraiment changé.\n\nJ'entends encore beaucoup de professionnels parler de SEO comme en 2019. Bourrage de mots-clés, backlinks en masse, articles génériques…\n\nLa réalité de 2026 est radicalement différente.\n\nGoogle SGE répond directement aux questions. Le clic organique classique est en chute libre. La seule façon d'exister : être la source que l'IA cite.\n\nComment ?\n• Créer du contenu expert et vérifiable\n• Structurer clairement (H1 > H2 > réponses directes)\n• Construire une vraie autorité thématique\n\nLe SEO n'est pas mort. Il s'est transformé.\n\n#SEO #Référencement #ContentMarketing`,
            "instagram-stories": `✨ SEO 2026 : les règles ont changé\n\nCe qui fonctionnait avant ne marche plus.\nMais les opportunités sont énormes pour ceux qui s'adaptent.\n\n📌 Sauvegarde ce post !\n\n#SEO #Marketing #ContentCreator #Référencement`,
            "instagram-post": `✨ SEO 2026 : les règles ont changé\n\nCe qui fonctionnait avant ne marche plus.\nMais les opportunités sont énormes pour ceux qui s'adaptent.\n\n📌 Sauvegarde ce post !\n\n#SEO #Marketing #ContentCreator #Référencement`,
        };
        setContent(mockContent[plateforme]);
        setGenerating(false);
    };

    return (
        <div className="flex gap-5 h-full max-h-[calc(100vh-4rem)]">
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto pr-1">
                <div>
                    <h1 className="text-2xl font-bold font-display">Rédaction de contenus</h1>
                    <p className="text-sm text-base-content/50 mt-1">
                        Transformez vos articles SEO en contenu viral pour chaque plateforme.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {PLATEFORMES.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPlateforme(p.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                plateforme === p.id
                                    ? "border-base-content bg-base-100 shadow-sm"
                                    : "border-base-300 bg-base-100 hover:border-base-content/30"
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                plateforme === p.id ? "bg-base-content text-base-100" : "bg-base-200 text-base-content/50"
                            }`}>
                                {p.icon}
                            </div>
                            <div>
                                <p className={`text-sm font-semibold leading-tight ${plateforme === p.id ? "" : "text-base-content/60"}`}>
                                    {p.label}
                                </p>
                                <p className="text-xs text-base-content/40">{p.sub}</p>
                            </div>
                            {plateforme === p.id && (
                                <CheckCircle2 size={16} className="ml-1 text-base-content shrink-0" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="card bg-base-100 border border-base-300 shadow-xs flex-1 flex flex-col min-h-72">
                    <EditorToolbar />
                    <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start typing here..."
                        className="w-full h-full min-h-64 p-4 text-sm leading-relaxed resize-none bg-transparent outline-none text-base-content placeholder:text-base-content/25"
                    />
                        {generating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm rounded-b-xl">
                                <div className="flex flex-col items-center gap-3">
                                    <span className="loading loading-dots loading-md text-base-content/40" />
                                    <p className="text-sm text-base-content/40">Génération en cours...</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 border-t border-base-300">
            <span className={`text-xs ${charColor}`}>
              {charCount} / {currentPlateforme.maxChars} caractères
            </span>
                        <div className="w-24 h-1 bg-base-300 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${charPercent > 90 ? "bg-error" : charPercent > 70 ? "bg-warning" : "bg-success"}`}
                                style={{ width: `${charPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            <div className="w-96 shrink-0 flex flex-col gap-4 overflow-y-auto">
                <div className="card bg-base-100 border border-base-300 shadow-xs">
                    <div className="card-body p-5 gap-4">
                        <h2 className="font-bold text-sm">Paramétrage</h2>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-base-content/50 font-medium">Sujet / instructions</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ex : un post sur le SEO en 2026 avec un ton expert..."
                                rows={4}
                                className="textarea textarea-bordered textarea-sm text-sm leading-relaxed resize-none w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-base-content/50 font-medium">Ton</label>
                            <select
                                value={ton}
                                onChange={(e) => setTon(e.target.value)}
                                className="select select-bordered select-sm text-sm w-full"
                            >
                                <option value="professionnel">Professionnel</option>
                                <option value="decontracte">Décontracté</option>
                                <option value="inspirant">Inspirant</option>
                                <option value="educatif">Éducatif</option>
                                <option value="humoristique">Humoristique</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-base-content/50 font-medium">Longueur</label>
                            <div className="join w-full">
                                {(["court", "moyen", "long"] as const).map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLongueur(l)}
                                        className={`join-item btn btn-xs flex-1 capitalize ${longueur === l ? "btn-neutral" : "btn-ghost border border-base-300"}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerer}
                            disabled={generating || !prompt.trim()}
                            className="btn btn-outline btn-sm w-full gap-2 rounded-lg"
                        >
                            {generating ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <Sparkles size={13} />
                            )}
                            {generating ? "Génération..." : "Générer"}
                        </button>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-300 shadow-xs">
                    <div className="card-body p-5 gap-3">
                        <h2 className="font-bold text-sm">Aperçu direct</h2>
                        <Apercu plateforme={plateforme} content={content} />
                    </div>
                </div>

                <button className="btn btn-primary gap-2 rounded-xl w-full">
                    Ajouter votre post
                    <ArrowRight size={15} />
                </button>

            </div>
        </div>
    );
}
"use client";

import {useState} from "react";
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import {Platform, PlatformConfig, PlatformType} from "@/app/types/types";
import Preview from "@/app/components/content/writing/Preview";
import TextEditor from "@/app/components/content/writing/TextEditor";

export default function WritingPage() {
    const [platform, setPlatform] = useState<PlatformType>(Platform.LINKEDIN);
    const [content, setContent] = useState("");
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState("professionnel");
    const [length, setLength] = useState("moyen");
    const [generating, setGenerating] = useState(false);
    const currentPlatform = PlatformConfig[platform];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        await new Promise((r) => setTimeout(r, 1600));
        const mockContent: Record<PlatformType, string> = {
            Twitter: `🚀 Le SEO en 2026, ça ressemble à quoi ?\n\nSpoiler : les vieilles recettes ne marchent plus.\n\nVoici ce qui fonctionne vraiment maintenant :\n\n→ Contenu expert et dense\n→ Expérience utilisateur au cœur\n→ Être cité par les IA génératives\n\nLe trafic organique classique baisse. Mais pour ceux qui s'adaptent, l'opportunité est immense.\n\n#SEO #MarketingDigital #IA [Thread]`,
            LinkedIn: `Le SEO en 2026 : ce qui a vraiment changé.\n\nJ'entends encore beaucoup de professionnels parler de SEO comme en 2019. Bourrage de mots-clés, backlinks en masse, articles génériques…\n\nLa réalité de 2026 est radicalement différente.\n\nGoogle SGE répond directement aux questions. Le clic organique classique est en chute libre. La seule façon d'exister : être la source que l'IA cite.\n\nComment ?\n• Créer du contenu expert et vérifiable\n• Structurer clairement (H1 > H2 > réponses directes)\n• Construire une vraie autorité thématique\n\nLe SEO n'est pas mort. Il s'est transformé.\n\n#SEO #Référencement #ContentMarketing`,
            Instagram: `✨ SEO 2026 : les règles ont changé\n\nCe qui fonctionnait avant ne marche plus.\nMais les opportunités sont énormes pour ceux qui s'adaptent.\n\n📌 Sauvegarde ce post !\n\n#SEO #Marketing #ContentCreator #Référencement`,
            Blog: `✨ SEO 2026 : les règles ont changé\n\nCe qui fonctionnait avant ne marche plus.\nMais les opportunités sont énormes pour ceux qui s'adaptent.\n\n📌 Sauvegarde ce post !\n\n#SEO #Marketing #ContentCreator #Référencement`,
        };
        setContent(mockContent[platform]);
        setGenerating(false);
    };

    return (
        <div className="flex gap-5 h-full max-h-[calc(100vh-4rem)]">
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto pr-1">
                <div>
                    <h1 className="text-2xl font-bold font-display">Rédaction de contenus</h1>
                    <p className="text-sm text-base-content/50 mt-1">
                        Transformez vos articles SEO en contenu viral pour chaque platform.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {(Object.entries(PlatformConfig) as [PlatformType, (typeof PlatformConfig)[PlatformType]][]).map(
                        ([platformKey, config]) => (
                            <button
                                key={platformKey}
                                onClick={() => setPlatform(platformKey)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:cursor-pointer ${
                                    platform === platformKey
                                        ? "border-base-content bg-base-100 shadow-sm"
                                        : "border-base-300 bg-base-100 hover:border-base-content/30"
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    platform === platformKey ? "bg-base-content text-base-100" : "bg-base-200 text-base-content/50"
                                }`}>
                                    {config.icon}
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold leading-tight ${platform === platformKey ? "" : "text-base-content/60"}`}>
                                        {config.label}
                                    </p>
                                    <p className="text-xs text-base-content/40">{config.subLabel}</p>
                                </div>
                                {platform === platformKey && (
                                    <CheckCircle2 size={16} className="ml-1 text-base-content shrink-0"/>
                                )}
                            </button>
                        ))}
                </div>

                <div className="card bg-base-100 border border-base-300 shadow-xs flex-1 flex flex-col min-h-72">
                    <TextEditor
                        content={content}
                        onChange={setContent}
                        maxChars={currentPlatform.maxLength}
                        placeholder="Commencez à taper..."
                    />
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
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
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
                                        onClick={() => setLength(l)}
                                        className={`join-item btn btn-xs flex-1 capitalize ${length === l ? "btn-neutral" : "btn-ghost border border-base-300"}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !prompt.trim()}
                            className="btn btn-outline btn-sm w-full gap-2 rounded-lg"
                        >
                            {generating ? (
                                <span className="loading loading-spinner loading-xs"/>
                            ) : (
                                <Sparkles size={13}/>
                            )}
                            {generating ? "Génération..." : "Générer"}
                        </button>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-300 shadow-xs">
                    <div className="card-body p-5 gap-3">
                        <h2 className="font-bold text-sm">Aperçu direct</h2>
                        <Preview platform={platform} content={content}/>
                    </div>
                </div>

                <button className="btn btn-primary gap-2 rounded-xl w-full">
                    Ajouter votre post
                    <ArrowRight size={15}/>
                </button>

            </div>
        </div>
    );
}
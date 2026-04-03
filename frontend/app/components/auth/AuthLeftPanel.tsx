import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function AuthLeftPanel() {
    return (
        <div className="relative hidden lg:flex lg:w-1/2 min-h-screen bg-accent flex-col justify-center items-center p-12 overflow-hidden">
            <div className="absolute w-64 h-64 -right-16 -top-20 bg-white/10 rounded-full" />
            <div className="absolute w-96 h-96 -left-10 bottom-[-80px] bg-black/20 rounded-full" />

            <div className="relative z-10 flex flex-col gap-3.5 max-w-[512px] w-full">
                <div className="flex items-center gap-3 mb-2">
                    <Image src="/logo.png" alt="Logo" width={42} height={42}/>
                    <span className="text-white text-3xl font-normal font-display">
                        Épilogue
                    </span>
                </div>

                <h1 className="text-white text-5xl xl:text-6xl font-extrabold leading-tight">
                    Générez du contenu SEO avec l&apos;IA.
                </h1>

                <p className="text-white/80 text-lg leading-7">
                    Connectez votre Notion et automatisez votre stratégie de contenu en
                    quelques clics. Rejoignez +2 000 créateurs de contenu.
                </p>

                <div className="mt-2 p-6 bg-white/15 backdrop-blur-sm rounded-xl border-2 border-white/20 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <img
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                                    alt="avatar"
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1 text-white/90 text-sm">
                            <span className="font-bold">4.9/5</span>
                            <span className="font-normal">basé sur 500+ avis</span>
                        </div>
                    </div>
                    <p className="text-white/90 text-sm leading-5">
                        &quot;L&apos;intégration Notion a totalement changé notre workflow.
                        On publie 3x plus d&apos;articles par semaine désormais.&quot;
                    </p>
                    <p className="text-white/70 text-xs">— Thomas D., Content Manager</p>
                </div>

                <div className="flex items-center gap-6 mt-1">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Pas de CB requise</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Intégration Notion</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
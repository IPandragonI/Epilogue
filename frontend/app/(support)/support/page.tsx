"use client";

import {useState} from "react";
import {
    HelpCircle,
    ChevronDown,
    Mail,
    Sparkles,
    Layers,
    RefreshCw,
    CreditCard,
    Users,
    ExternalLink,
    MessageCircle,
    BookOpen,
} from "lucide-react";

interface FaqItem {
    q: string;
    a: string;
}

interface FaqCategory {
    icon: React.ReactNode;
    label: string;
    items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
    {
        icon: <Sparkles size={15}/>,
        label: "Génération de contenu IA",
        items: [
            {
                q: "Comment fonctionne la génération de posts ?",
                a: "Épilogue utilise Mistral AI pour générer du contenu adapté à chaque plateforme. Vous créez d'abord une idée de contenu, puis l'IA rédige un post optimisé selon les contraintes de la plateforme cible (longueur, ton, format).",
            },
            {
                q: "Quelles plateformes sont supportées ?",
                a: "La génération est disponible pour quatre plateformes : Blog (long format SEO), LinkedIn (professionnel), Twitter/X (court, percutant) et Instagram (engageant, avec hashtags). Chaque plateforme a ses propres règles de longueur et de style.",
            },
            {
                q: "Qu'est-ce qu'un « token IA » ?",
                a: "Les tokens sont l'unité de mesure de consommation de l'API Mistral. Chaque génération de post ou analyse SEO consomme un certain nombre de tokens. Votre plan définit un quota mensuel de tokens. Les compteurs se réinitialisent automatiquement le 1er de chaque mois.",
            },
            {
                q: "Puis-je modifier le contenu généré ?",
                a: "Oui. Après génération, le post s'ouvre dans l'éditeur TipTap où vous pouvez librement rédiger, corriger et enrichir le texte avant de le publier ou le sauvegarder en brouillon.",
            },
        ],
    },
    {
        icon: <Layers size={15}/>,
        label: "Curation de contenu",
        items: [
            {
                q: "Qu'est-ce que la curation de contenu ?",
                a: "La curation vous permet d'agréger des articles depuis des sources RSS ou des URLs spécifiques. Les items collectés peuvent ensuite servir d'inspiration ou être utilisés directement pour générer un post IA basé sur leur contenu.",
            },
            {
                q: "Comment ajouter une source de curation ?",
                a: "Rendez-vous dans la section « Curation de contenu », puis ajoutez une source en renseignant son URL (flux RSS ou page web). Épilogue scrape automatiquement le contenu via Puppeteer en mode furtif.",
            },
            {
                q: "Quelle est la limite de curations ?",
                a: "Le nombre de curations mensuelles dépend de votre plan d'abonnement. Consultez la page Abonnement pour voir votre quota actuel et votre consommation du mois en cours.",
            },
        ],
    },
    {
        icon: <RefreshCw size={15}/>,
        label: "Synchronisation Notion",
        items: [
            {
                q: "Comment connecter mon espace Notion ?",
                a: "Dans Paramètres > Intégration Notion, renseignez la clé secrète de votre intégration. Créez une intégration sur notion.so/my-integrations, accordez-lui l'accès à vos bases de données, puis copiez la clé (commence par « ntn_ »).",
            },
            {
                q: "Qu'est-ce qui est synchronisé vers Notion ?",
                a: "Chaque post publié peut être synchronisé vers une base de données Notion de votre choix. Le titre, le corps du contenu, la plateforme et le statut sont exportés. Vous pouvez ainsi gérer votre calendrier éditorial directement dans Notion.",
            },
            {
                q: "Qui peut configurer l'intégration Notion ?",
                a: "Seul un administrateur de l'agence peut renseigner ou modifier la clé Notion. Les membres avec le rôle PUBLIC peuvent utiliser la synchronisation mais pas la reconfigurer.",
            },
        ],
    },
    {
        icon: <CreditCard size={15}/>,
        label: "Abonnement & facturation",
        items: [
            {
                q: "Comment changer de plan ?",
                a: "Rendez-vous sur la page Abonnement. Si vous êtes administrateur de l'agence, vous pouvez sélectionner un nouveau plan directement. Pour les plans payants, vous serez redirigé vers Stripe Checkout (paiement sécurisé). Les plans gratuits sont activés instantanément.",
            },
            {
                q: "Les quotas se réinitialisent-ils automatiquement ?",
                a: "Oui. Les compteurs de tokens, de curations et de générations d'idées se remettent à zéro chaque mois, de façon automatique et transparente.",
            },
            {
                q: "Que se passe-t-il si je dépasse mon quota ?",
                a: "Lorsqu'un quota mensuel est atteint, les actions correspondantes sont bloquées avec un message explicatif. Vous pouvez à tout moment passer à un plan supérieur pour débloquer davantage de capacité.",
            },
            {
                q: "Comment annuler mon abonnement ?",
                a: "Pour revenir au plan gratuit, sélectionnez-le depuis la page Abonnement. Votre abonnement actuel est immédiatement remplacé. Contactez le support si vous rencontrez un problème lors du changement.",
            },
        ],
    },
    {
        icon: <Users size={15}/>,
        label: "Compte & équipe",
        items: [
            {
                q: "Comment inviter un membre dans mon agence ?",
                a: "Dans Paramètres > Agence, cliquez sur « Nouvel utilisateur » (réservé aux administrateurs). Renseignez le prénom, nom, email et un mot de passe temporaire. Le nouvel utilisateur pourra se connecter immédiatement.",
            },
            {
                q: "Quelle est la différence entre ADMIN et PUBLIC ?",
                a: "Un ADMIN peut gérer l'abonnement, configurer l'intégration Notion, inviter et supprimer des membres. Un PUBLIC peut créer et gérer ses propres contenus mais n'a pas accès aux paramètres sensibles de l'agence.",
            },
            {
                q: "Puis-je connecter mon compte Google ?",
                a: "Oui. Depuis la page de connexion, utilisez « Continuer avec Google » pour associer votre compte Google. L'authentification est gérée via OAuth2 et un JWT sécurisé est stocké dans un cookie HTTP-only.",
            },
        ],
    },
];

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

function FaqAccordion({items}: { items: FaqItem[] }) {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <div className="flex flex-col divide-y divide-base-200">
            {items.map((item, i) => (
                <div key={i}>
                    <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="flex items-center justify-between w-full gap-4 py-3.5 text-left group"
                    >
                        <span
                            className={`text-sm font-medium transition-colors ${open === i ? "text-accent" : "text-base-content group-hover:text-accent/80"}`}>
                            {item.q}
                        </span>
                        <ChevronDown
                            size={15}
                            className={`shrink-0 text-base-content/40 transition-transform duration-200 ${open === i ? "rotate-180 text-accent" : ""}`}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-200 ${open === i ? "max-h-48 pb-3.5" : "max-h-0"}`}>
                        <p className="text-sm text-base-content/60 leading-relaxed">{item.a}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function FaqCategorySection({category}: { category: FaqCategory }) {
    return (
        <div className="card bg-base-100 border border-base-300 shadow-none rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-base-300 bg-base-50">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    {category.icon}
                </div>
                <h2 className="text-sm font-bold text-base-content">{category.label}</h2>
                <span className="ml-auto text-xs text-base-content/30">
                    {category.items.length} question{category.items.length > 1 ? "s" : ""}
                </span>
            </div>
            <div className="px-5">
                <FaqAccordion items={category.items}/>
            </div>
        </div>
    );
}

export default function SupportPage() {
    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">

            <div>
                <h1 className="text-2xl font-bold text-base-content">Support</h1>
                <p className="text-sm text-base-content/50 mt-1">
                    FAQ et contact
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    {
                        icon: <MessageCircle size={16}/>,
                        label: "Chat support",
                        desc: "Réponse sous 24h",
                        href: "mailto:support@epilogue.app",
                        external: false,
                    },
                    {
                        icon: <HelpCircle size={16}/>,
                        label: "FAQ",
                        desc: "Questions fréquentes",
                        href: "#faq",
                        external: false,
                    },
                ].map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-base-300 bg-base-100 hover:border-accent/40 hover:bg-accent/5 transition-colors group"
                    >
                        <div
                            className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent/20 transition-colors">
                            {item.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-base-content leading-tight">{item.label}</p>
                            <p className="text-xs text-base-content/45 truncate">{item.desc}</p>
                        </div>
                        {item.external && (
                            <ExternalLink size={12}
                                          className="ml-auto shrink-0 text-base-content/25 group-hover:text-accent/60 transition-colors"/>
                        )}
                    </a>
                ))}
            </div>

            <div id="faq" className="flex flex-col gap-3">
                {FAQ_CATEGORIES.map((cat) => (
                    <FaqCategorySection key={cat.label} category={cat}/>
                ))}
            </div>

            <Section
                title="Nous contacter"
                subtitle="Une question non couverte par la FAQ ?"
                icon={<Mail size={15} strokeWidth={1.8}/>}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-base-content/60 leading-relaxed">
                        Notre équipe est disponible du lundi au vendredi, de 9h à 18h (heure de Paris).
                        Nous répondons généralement sous 24h ouvrées.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a
                            href="mailto:support@epilogue.app"
                            className="btn btn-sm bg-accent border-0 text-white hover:bg-accent/85 gap-2"
                        >
                            <Mail size={14}/>
                            support@epilogue.app
                        </a>
                        <div className="flex items-center gap-2 text-xs text-base-content/40 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"/>
                            Support disponible
                        </div>
                    </div>
                </div>
            </Section>

            <div className="flex items-center justify-between text-xs text-base-content/25 px-1 pb-2">
                <span>Épilogue · Version 1.0</span>
                <span>NestJS 11 + Next.js 16</span>
            </div>

        </div>
    );
}

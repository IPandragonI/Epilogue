"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import Image from "next/image";
import {
    LayoutDashboard,
    FileText,
    Layers,
    RefreshCw,
    HelpCircle,
    Settings,
    ChevronDown,
} from "lucide-react";

type NavChild = { label: string; href: string };

type NavItem =
    | { type: "link"; label: string; href: string; icon: React.ReactNode }
    | {
    type: "group";
    label: string;
    icon: React.ReactNode;
    children: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
    {
        type: "link",
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={18}/>,
    },
    {
        type: "group",
        label: "Contenu",
        icon: <FileText size={18}/>,
        children: [
            {label: "Mes posts", href: "/contenu/posts"},
            {label: "Génération d'idées", href: "/contenu/idees"},
            {label: "Rédaction de contenus", href: "/contenu/redaction"},
        ],
    },
    {
        type: "link",
        label: "Curation de contenu",
        href: "/curation",
        icon: <Layers size={18}/>,
    },
    {
        type: "group",
        label: "Synchronisation Notion",
        icon: <RefreshCw size={18}/>,
        children: [
            {label: "Stockage de contenus", href: "/notion/stockage"},
            {label: "Calendrier éditorial", href: "/notion/calendrier"},
            {label: "Archives", href: "/notion/archives"},
        ],
    },
];

const BOTTOM_ITEMS = [
    {label: "Support", href: "/support", icon: <HelpCircle size={18}/>},
    {label: "Paramètres", href: "/parametres", icon: <Settings size={18}/>},
];


function NavGroup({item, isOpen}: {
    item: Extract<NavItem, { type: "group" }>;
    isOpen: boolean;
}) {
    const pathname = usePathname();
    const isActiveGroup = item.children.some((c) => pathname === c.href);
    const [open, setOpen] = useState(isActiveGroup);

    if (!isOpen) {
        return (
            <li>
                <button
                    title={item.label}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
                >
                    <span className="shrink-0">{item.icon}</span>
                </button>
            </li>
        );
    }

    return (
        <li>
            <button
                onClick={() => setOpen((v) => !v)}
                className={
                    `flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors 
                    ${isActiveGroup
                        ? "text-base-content font-semibold"
                        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"}`}
            >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1 text-sm">{item.label}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 shrink-0 ${open ? "rotate-0" : "-rotate-90"}`}
                />
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <ul className="ml-7 mt-1 flex flex-col gap-0.5">
                    {item.children.map((child) => (
                        <li key={child.href}>
                            <Link
                                href={child.href}
                                className={`block px-3 py-1.5 rounded-lg text-sm transition-colors
                                    ${pathname === child.href
                                    ? "text-base-content font-medium"
                                    : "text-base-content/50 hover:text-base-content hover:bg-base-200"}
                                `}
                            >
                                {child.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );
}

function NavLink({item, isOpen}: {
    item: Extract<NavItem, { type: "link" }>;
    isOpen: boolean;
}) {
    const pathname = usePathname();
    const isActive = pathname === item.href;

    return (
        <li>
            <Link
                href={item.href}
                title={!isOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive
                    ? "bg-base-400 text-accent font-semibold"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"}
                `}
            >
                <span className="shrink-0">{item.icon}</span>
                {isOpen && <span className="text-sm">{item.label}</span>}
            </Link>
        </li>
    );
}

export default function Sidebar({isOpen}: { isOpen: boolean }) {
    return (
        <aside
            className={`flex flex-col bg-base-100 border-r border-base-200 shrink-0 transition-all duration-300 ease-in-out overflow-hidden
                ${isOpen ? "w-56" : "w-14"}`}
        >
            <Link href={"/dashboard"} className="flex items-center gap-2.5 px-4 h-16 border-b border-base-200 shrink-0">
                <Image src="/logo.png" alt="Logo" width={32} height={32}/>
                {isOpen && (
                    <span className="font-bold text-lg tracking-tight whitespace-nowrap">
            Épilogue
          </span>
                )}
            </Link>

            <nav className="flex-1 px-2 py-4 overflow-y-auto">
                <ul className="flex flex-col gap-0.5">
                    {NAV_ITEMS.map((item, i) =>
                        item.type === "link" ? (
                            <NavLink key={i} item={item} isOpen={isOpen}/>
                        ) : (
                            <NavGroup key={i} item={item} isOpen={isOpen}/>
                        )
                    )}
                </ul>
            </nav>

            <div className="px-2 pb-4 border-t border-base-200 pt-3">
                <ul className="flex flex-col gap-0.5">
                    {BOTTOM_ITEMS.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                title={!isOpen ? item.label : undefined}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors"
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {isOpen && <span className="text-sm">{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
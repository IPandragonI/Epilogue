"use client";

import { Menu, Search, Bell } from "lucide-react";
import { ChevronDown } from "lucide-react";

interface NavbarProps {
    onToggleSidebar: () => void;
    user: any;
}

export default function Navbar({ onToggleSidebar, user }: NavbarProps) {
    return (
        <header className="h-16 shrink-0 bg-base-100 border-b border-base-200 flex items-center gap-4 px-4">
            <button
                onClick={onToggleSidebar}
                className="btn btn-ghost btn-sm btn-square"
                aria-label="Toggle sidebar"
            >
                <Menu size={18} />
            </button>

            <div className="flex-1 max-w-sm">
                <label className="input input-bordered input-sm flex items-center gap-2 rounded-full">
                    <Search size={14} className="text-base-content/40 shrink-0" />
                    <input type="text" placeholder="Search" className="grow text-sm" />
                </label>
            </div>

            <div className="flex-1" />

            <button className="btn btn-ghost btn-sm btn-square relative" aria-label="Notifications">
                <Bell size={18} />
            </button>

            <div className="dropdown dropdown-end">
                <label
                    tabIndex={0}
                    className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-base-200 transition-colors"
                >
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">DJ</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                        {user ? `${user.firstname} ${user.lastname}` : "Invité"}
                    </span>
                    <ChevronDown size={14} className="text-base-content/50" />
                </label>

                <ul
                    tabIndex={0}
                    className="dropdown-content menu menu-sm shadow-lg bg-base-100 rounded-box w-48 z-50 border border-base-200 mt-1"
                >
                    <li><a>Mon profil</a></li>
                    <li><a>Paramètres</a></li>
                    <li className="divider my-0" />
                    <li>
                        <button
                            onClick={async () => {
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                                    method: "POST",
                                    credentials: "include",
                                });

                                window.location.href = "/login";
                            }}
                            className="text-error"
                        >
                            Se déconnecter
                        </button>
                    </li>
                </ul>
            </div>
        </header>
    );
}
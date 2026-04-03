"use client";

import {useState} from "react";
import Sidebar from "./app/Sidebar";
import Navbar from "./app/Navbar";

export default function AppLayout({children}: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar isOpen={sidebarOpen}/>
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)}/>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
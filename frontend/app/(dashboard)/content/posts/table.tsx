"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowUpDown, Archive, ArchiveRestore} from "lucide-react";
import {Content, ContentStatus} from "@/app/types/types";
import ScoreBar from "@/app/components/content/ScoreBar";
import StatusBadge from "@/app/components/content/StatusBadge";
import Table, {Column} from "@/app/components/app/Table";
import {usePagination} from "@/app/hooks/usePagination";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function DashboardTable() {
    const [showArchived, setShowArchived] = useState(false);

    const {data, total, page, lastPage, loading, error, setPage, refetch} = usePagination<Content>({
        url: `${API_URL}/content/with-seo-paginated`,
        limit: 5,
        query: showArchived ? {status: ContentStatus.ARCHIVED} : undefined,
    });

    const handleToggleArchive = async (item: Content) => {
        const archiving = item.status !== ContentStatus.ARCHIVED;
        const result = await Swal.fire({
            title: archiving ? "Archiver ce post ?" : "Restaurer ce post ?",
            text: archiving
                ? "Le post sera masqué de la liste principale mais pourra être restauré."
                : "Le post redeviendra un brouillon.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: archiving ? "Archiver" : "Restaurer",
            cancelButtonText: "Annuler",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`${API_URL}/content/${item.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({
                    status: archiving ? ContentStatus.ARCHIVED : ContentStatus.DRAFT,
                }),
            });
            if (!res.ok) throw new Error();
            refetch();
        } catch {
            await Swal.fire({icon: "error", title: "Une erreur est survenue, veuillez réessayer"});
        }
    };

    const columns: Column<Content>[] = [
        {
            key: "title",
            header: <span className="font-medium pl-6">Titre</span>,
            className: "pl-6 font-medium text-sm max-w-xs truncate",
            renderer: (item) => (
                <Link href={`/content/posts/${item.id}`} className="hover:underline underline-offset-2">
                    {item.title}
                </Link>
            ),
        },
        {
            key: "date",
            header: (
                <span className="flex items-center gap-1 font-medium">
                    Date <ArrowUpDown size={12}/>
                </span>
            ),
            renderer: (item) => <span className="text-sm text-base-content/50">{item.date}</span>,
        },
        {
            key: "seo",
            header: <span className="font-medium">Score SEO</span>,
            renderer: (item) => <ScoreBar score={item.seo?.score ?? 0}/>,
        },
        {
            key: "status",
            header: <span className="font-medium">Status</span>,
            renderer: (item) => <StatusBadge status={item.status}/>,
        },
        {
            key: "actions",
            header: <span className="font-medium pr-6">Actions</span>,
            className: "pr-6 text-right",
            renderer: (item) => (
                <button
                    onClick={() => handleToggleArchive(item)}
                    className="btn btn-ghost btn-xs gap-1.5 rounded-lg"
                    title={item.status === ContentStatus.ARCHIVED ? "Restaurer" : "Archiver"}
                >
                    {item.status === ContentStatus.ARCHIVED ? <ArchiveRestore size={13}/> : <Archive size={13}/>}
                    {item.status === ContentStatus.ARCHIVED ? "Restaurer" : "Archiver"}
                </button>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-6 pt-4">
                <div className="join">
                    <button
                        onClick={() => {setShowArchived(false); setPage(1);}}
                        className={`join-item btn btn-sm rounded-l-full ${!showArchived ? "btn-active" : "btn-outline"}`}
                    >
                        Actifs
                    </button>
                    <button
                        onClick={() => {setShowArchived(true); setPage(1);}}
                        className={`join-item btn btn-sm rounded-r-full ${showArchived ? "btn-active" : "btn-outline"}`}
                    >
                        Archivés
                    </button>
                </div>
            </div>

            <Table<Content>
                data={data}
                columns={columns}
                keyExtractor={(item) => item.id}
                total={total}
                page={page}
                lastPage={lastPage}
                loading={loading}
                error={error}
                onPageChange={setPage}
                emptyMessage={showArchived ? "Aucun post archivé." : "Aucun contenu trouvé."}
            />
        </div>
    );
}
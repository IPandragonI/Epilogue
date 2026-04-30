"use client";

import Link from "next/link";
import {ArrowUpDown} from "lucide-react";
import {Content} from "@/app/types/types";
import ScoreBar from "@/app/components/content/ScoreBar";
import StatusBadge from "@/app/components/content/StatusBadge";
import Table, {Column} from "@/app/components/app/Table";
import {usePagination} from "@/app/hooks/usePagination";

const COLUMNS: Column<Content>[] = [
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
];

export default function DashboardTable() {
    const {data, total, page, lastPage, loading, error, setPage} = usePagination<Content>({
        url: `${process.env.NEXT_PUBLIC_API_URL}/content/with-seo-paginated`,
        limit: 5,
    });

    return (
        <Table<Content>
            data={data}
            columns={COLUMNS}
            keyExtractor={(item) => item.id}
            total={total}
            page={page}
            lastPage={lastPage}
            loading={loading}
            error={error}
            onPageChange={setPage}
            emptyMessage="Aucun contenu trouvé."
        />
    );
}
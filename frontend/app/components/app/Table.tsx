"use client";

import {ChevronLeft, ChevronRight, Loader2} from "lucide-react";
import {ReactNode} from "react";

export type Column<T> = {
    key: string;
    header: ReactNode;
    renderer: (item: T) => ReactNode;
    className?: string;
};

type Props<T> = {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    total: number;
    page: number;
    lastPage: number;
    loading: boolean;
    error: string | null;
    onPageChange: (page: number) => void;
    emptyMessage?: string;
};

export default function Table<T>({
                                     data,
                                     columns,
                                     keyExtractor,
                                     total,
                                     page,
                                     lastPage,
                                     loading,
                                     error,
                                     onPageChange,
                                     emptyMessage = "Aucun résultat trouvé.",
                                 }: Props<T>) {
    const pages = Array.from({length: lastPage}, (_, i) => i + 1);

    return (
        <>
            {error && (
                <div className="alert alert-error mx-4 mb-2">{error}</div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-accent" size={32}/>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                        <tr className="border-base-300 text-base-content/50 text-xs uppercase tracking-wide">
                            {columns.map((col) => (
                                <th key={col.key} className={col.className}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-10 text-base-content/40 text-sm">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={keyExtractor(item)}
                                    className="border-base-300 hover:bg-base-200 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className={col.className}>
                                            {col.renderer(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex items-center justify-between px-6 py-4 border-t border-base-300">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    className="btn btn-sm btn-outline rounded-full gap-1 disabled:opacity-40"
                >
                    <ChevronLeft size={14}/> Précédent
                </button>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-base-content/40 mr-2">{total} résultats</span>
                    <div className="join">
                        {pages.map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                disabled={loading}
                                className={`join-item btn btn-sm btn-ghost w-8 ${p === page ? "btn-active" : ""}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onPageChange(Math.min(lastPage, page + 1))}
                    disabled={page === lastPage || loading}
                    className="btn btn-sm btn-outline rounded-full gap-1 disabled:opacity-40"
                >
                    Suivant <ChevronRight size={14}/>
                </button>
            </div>
        </>
    );
}
"use client";

import {useEffect, useState, useCallback} from "react";

type UsePaginationOptions = {
    url: string;
    limit?: number;
};

type UsePaginationReturn<T> = {
    data: T[];
    total: number;
    page: number;
    lastPage: number;
    loading: boolean;
    error: string | null;
    setPage: (page: number) => void;
};

export function usePagination<T>({url, limit = 5}: UsePaginationOptions): UsePaginationReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (currentPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${url}?page=${currentPage}&limit=${limit}`);
            if (!response.ok) throw new Error("Erreur serveur");
            const result = await response.json();
            setData(result.data);
            setTotal(result.meta.total);
            setLastPage(result.meta.lastPage);
        } catch {
            setError("Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    }, [url, limit]);

    useEffect(() => {
        fetchData(page);
    }, [page, fetchData]);

    return {data, total, page, lastPage, loading, error, setPage};
}
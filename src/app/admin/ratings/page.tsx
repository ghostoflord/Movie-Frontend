'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ratingAPI } from '@/lib/api';
import type { Rating } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';
import { AdminPagination } from '@/components/admin/admin-pagination';

type RatingsPayload = {
    data: Rating[];
    meta?: { current_page?: number; total?: number; last_page?: number; per_page?: number };
};

function unwrapRatings(raw: unknown): RatingsPayload {
    if (raw && typeof raw === 'object') {
        const o = raw as any;
        if (Array.isArray(o.data)) return { data: o.data, meta: o.meta };
        if (o.data && typeof o.data === 'object' && Array.isArray(o.data.data)) {
            return { data: o.data.data, meta: o.data.meta ?? o.meta };
        }
        if (Array.isArray(o.ratings)) return { data: o.ratings, meta: o.meta };
    }
    return { data: [] };
}

export default function AdminRatingsPage() {
    const [items, setItems] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [meta, setMeta] = useState<RatingsPayload['meta'] | undefined>(undefined);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await ratingAPI.listPaged({ page, per_page: perPage });
            const p = unwrapRatings(raw);
            setItems(p.data);
            setMeta(p.meta);
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được ratings.' }));
            setItems([]);
            setMeta(undefined);
        } finally {
            setLoading(false);
        }
    }, [page, perPage]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const subtitle = useMemo(() => {
        const total = meta?.total ?? items.length;
        const pageLabel = meta?.current_page ? `Trang ${meta.current_page}` : `Trang ${page}`;
        return [pageLabel, `${total} ratings`].filter(Boolean).join(' · ');
    }, [meta, items.length, page]);

    const lastPage = meta?.last_page ?? Math.max(1, page);

    const onDelete = async (id: number) => {
        if (!confirm('Xóa rating này?')) return;
        try {
            await ratingAPI.delete(id);
            await fetchList();
        } catch (e) {
            alert(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Xóa thất bại.' }));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            </div>
        );
    }
    if (error) return <AdminErrorBox message={error} />;

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Ratings" subtitle={subtitle} actionHref="/admin/ratings/new" actionLabel="Thêm rating" />

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <table className="w-full">
                    <thead className="bg-zinc-900">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Movie ID</th>
                            <th className="px-4 py-3">Rating</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((r) => (
                            <tr key={r.id} className="text-sm text-zinc-200 hover:bg-white/[0.03]">
                                <td className="px-4 py-3 font-mono text-zinc-400">#{r.id}</td>
                                <td className="px-4 py-3 font-mono text-zinc-300">{r.movie_id}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-200">
                                        {r.rating}/10
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/ratings/${r.id}`}
                                            className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600/30"
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(r.id)}
                                            className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-600/30"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-500">
                                    Không có rating.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 ? (
                <AdminPagination
                    page={meta?.current_page ?? page}
                    lastPage={lastPage}
                    onPageChange={(p) => setPage(p)}
                    perPage={perPage}
                    onPerPageChange={(n) => {
                        setPerPage(n);
                        setPage(1);
                    }}
                    rightSlot={
                        <div className="text-sm text-zinc-500">
                            Trang {meta?.current_page ?? page}
                            {meta?.last_page ? ` / ${meta.last_page}` : null}
                        </div>
                    }
                />
            ) : null}
        </div>
    );
}


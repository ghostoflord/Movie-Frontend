'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ratingAPI } from '@/lib/api';
import type { Rating } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

export default function AdminRatingsPage() {
    const [items, setItems] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await ratingAPI.list();
            setItems(list);
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được ratings.' }));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

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
            <AdminPageHeader title="Ratings" subtitle={`${items.length} ratings`} actionHref="/admin/ratings/new" actionLabel="Thêm rating" />

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
                    </tbody>
                </table>
            </div>
        </div>
    );
}


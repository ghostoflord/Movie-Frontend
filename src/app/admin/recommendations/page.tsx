'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { recommendationsAPI } from '@/lib/api';
import type { RecommendationMovie } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

export default function AdminRecommendationsPage() {
    const [items, setItems] = useState<RecommendationMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await recommendationsAPI.get();
            setItems(list);
        } catch (e) {
            setError(
                toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, {
                    fallback: 'Không tải được gợi ý phim.',
                }),
            );
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

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
            <AdminPageHeader
                title="Gợi ý phim"
                subtitle="GET /api/recommendations — dựa trên lịch sử xem + favorites (cần token)"
            />

            {items.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có gợi ý (cần watch history / favorites).</p>
            ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {items.map((m) => (
                        <li key={m.id}>
                            <Link
                                href={`/phim/${m.id}`}
                                className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-red-600/40"
                            >
                                <div className="relative aspect-[2/3] bg-zinc-900">
                                    {m.thumb_url || m.poster_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={(m.poster_url || m.thumb_url) as string}
                                            alt={m.name}
                                            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                                            loading="lazy"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : null}
                                </div>
                                <div className="p-3">
                                    <p className="line-clamp-2 text-sm font-semibold text-white">{m.name}</p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {[m.origin_name, m.year ? String(m.year) : null].filter(Boolean).join(' · ') || '—'}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <button
                type="button"
                onClick={() => void fetchList()}
                className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
                Refresh
            </button>
        </div>
    );
}


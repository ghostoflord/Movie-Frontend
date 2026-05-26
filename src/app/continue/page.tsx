'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Trash2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { watchHistoryAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import type { WatchHistoryItem } from '@/types/watch-history';
import { WatchHistoryCard } from '@/components/client/watch-history-card';

export default function ContinueWatchingPage() {
    const { user, token, isLoading, isAuthenticated } = useAuth();
    const [items, setItems] = useState<WatchHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);

    const load = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const list = await watchHistoryAPI.listContinue({ per_page: 50 });
            setItems(list);
        } catch (e) {
            setItems([]);
            setError(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Không tải được lịch sử xem.',
                }),
            );
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isAuthenticated && token) {
            void load();
        }
    }, [isAuthenticated, token, load]);

    const onDeleteItem = async (item: WatchHistoryItem) => {
        if (!confirm('Xóa mục này khỏi lịch sử?')) return;
        try {
            await watchHistoryAPI.delete(item.id);
            setItems((prev) => prev.filter((x) => x.id !== item.id));
        } catch (e) {
            alert(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Xóa thất bại.',
                }),
            );
        }
    };

    const onDeleteMovie = async (item: WatchHistoryItem) => {
        const movieId = item.movie?.id;
        if (!movieId) return;
        if (!confirm(`Xóa toàn bộ lịch sử phim «${item.movie?.name ?? ''}»?`)) return;
        try {
            await watchHistoryAPI.deleteByMovie(movieId);
            setItems((prev) => prev.filter((x) => x.movie?.id !== movieId));
        } catch (e) {
            alert(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Xóa thất bại.',
                }),
            );
        }
    };

    const onClearAll = async () => {
        if (!confirm('Xóa toàn bộ lịch sử xem?')) return;
        setClearing(true);
        try {
            await watchHistoryAPI.clearAll();
            setItems([]);
        } catch (e) {
            alert(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Xóa thất bại.',
                }),
            );
        } finally {
            setClearing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-[#0b0b0f]">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e50914]" />
            </div>
        );
    }

    if (!user || !token) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
                <div className="rounded-2xl border border-white/10 bg-[#12121a] p-10">
                    <Clock className="mx-auto mb-4 h-10 w-10 text-[#e50914]" aria-hidden />
                    <h1 className="text-xl font-bold text-white">Tiếp tục xem</h1>
                    <p className="mt-2 text-sm text-zinc-400">Đăng nhập để xem lịch sử phim bạn đang xem dở.</p>
                    <Link
                        href="/login"
                        className="mt-6 inline-block rounded-lg bg-[#e50914] px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0b0f] text-zinc-100">
            <div className="mx-auto max-w-[1200px] px-4 py-8 pt-24">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white md:text-3xl">Tiếp tục xem</h1>
                        <p className="mt-1 text-sm text-zinc-400">Phim bạn xem gần đây — bấm để tiếp tục đúng tập.</p>
                    </div>
                    {items.length > 0 ? (
                        <button
                            type="button"
                            disabled={clearing}
                            onClick={() => void onClearAll()}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-2 text-sm text-red-200 transition hover:bg-red-950/70 disabled:opacity-60"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            {clearing ? 'Đang xóa…' : 'Xóa toàn bộ'}
                        </button>
                    ) : null}
                </div>

                {error ? (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="flex min-h-[30vh] items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-[#e50914]" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#12121a] py-16 text-center">
                        <User className="mx-auto mb-3 h-10 w-10 text-zinc-600" aria-hidden />
                        <p className="text-zinc-400">Chưa có lịch sử xem. Hãy xem phim và quay lại đây!</p>
                        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-[#e50914] hover:underline">
                            Khám phá phim
                        </Link>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <li key={item.id} className="relative">
                                <WatchHistoryCard item={item} onDelete={onDeleteItem} />
                                {item.movie?.id ? (
                                    <button
                                        type="button"
                                        onClick={() => void onDeleteMovie(item)}
                                        className="mt-2 text-xs text-zinc-500 hover:text-red-400"
                                    >
                                        Xóa lịch sử phim này
                                    </button>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

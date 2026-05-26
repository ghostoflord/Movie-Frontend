'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { watchHistoryAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { formatWatchTime } from '@/lib/format-watch-time';
import { getResumeSeconds, watchHistoryResumeHref } from '@/lib/watch-resume-url';
import type { WatchHistoryItem } from '@/types/watch-history';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';
import { useAuth } from '@/hooks/useAuth';

export default function AdminWatchHistoryPage() {
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();

    const [items, setItems] = useState<WatchHistoryItem[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        if (!token) {
            setItems([]);
            setListLoading(false);
            return;
        }
        setListLoading(true);
        setListError(null);
        try {
            const list = await watchHistoryAPI.listContinue({ per_page: 50 });
            setItems(list);
        } catch (e) {
            setItems([]);
            setListError(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Không tải được GET /watch-history/continue.',
                }),
            );
        } finally {
            setListLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading) {
            void fetchList();
        }
    }, [authLoading, fetchList]);

    const onDelete = async (item: WatchHistoryItem) => {
        if (!confirm(`Xóa lịch sử #${item.id}?`)) return;
        try {
            await watchHistoryAPI.delete(item.id);
            await fetchList();
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
        if (!confirm(`Xóa toàn bộ lịch sử phim «${item.movie?.name}»?`)) return;
        try {
            await watchHistoryAPI.deleteByMovie(movieId);
            await fetchList();
        } catch (e) {
            alert(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Xóa thất bại.',
                }),
            );
        }
    };

    const onClearAll = async () => {
        if (!confirm('Xóa toàn bộ lịch sử user đang đăng nhập?')) return;
        try {
            await watchHistoryAPI.clearAll();
            await fetchList();
        } catch (e) {
            alert(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Xóa thất bại.',
                }),
            );
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            </div>
        );
    }

    if (!isAuthenticated || !token) {
        return (
            <AdminErrorBox message="Cần đăng nhập (Bearer token) để xem lịch sử xem." />
        );
    }

    return (
        <div className="space-y-8">
            <AdminPageHeader title="Lịch sử xem / Tiếp tục xem" />

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => void fetchList()}
                    disabled={listLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
                >
                    <RefreshCw className={`h-4 w-4 ${listLoading ? 'animate-spin' : ''}`} aria-hidden />
                    Refresh list
                </button>
                <Link
                    href="/continue"
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Mở trang user /continue
                </Link>
                {items.length > 0 ? (
                    <button
                        type="button"
                        onClick={() => void onClearAll()}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2 text-sm text-red-200 hover:bg-red-950/60"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Xóa toàn bộ
                    </button>
                ) : null}
            </div>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    GET /watch-history/continue
                </h2>
                {listError ? (
                    <p className="mb-4 text-sm text-red-300">{listError}</p>
                ) : null}
                {listLoading ? (
                    <div className="flex min-h-[120px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        Chưa có dữ liệu. Xem phim trên site (đã đăng nhập) rồi bấm Refresh.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                                    <th className="pb-3 pr-4">Phim</th>
                                    <th className="pb-3 pr-4">Tập</th>
                                    <th className="pb-3 pr-4">Tiến độ</th>
                                    <th className="pb-3 pr-4">Link FE</th>
                                    <th className="pb-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/80">
                                {items.map((item) => {
                                    const resume = getResumeSeconds(item);
                                    const href = watchHistoryResumeHref(item);
                                    const progress = item.progress_percent ?? 0;
                                    return (
                                        <tr key={item.id} className="text-zinc-300">
                                            <td className="py-3 pr-4">
                                                <p className="font-medium text-white">
                                                    {item.movie?.name ?? '—'}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    movie #{item.movie?.id ?? '—'}
                                                </p>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {item.episode_label ??
                                                    (item.episode?.episode_number != null
                                                        ? `Tập ${item.episode.episode_number}`
                                                        : '—')}
                                                <p className="text-xs text-zinc-500">
                                                    ep #{item.episode?.id ?? '—'}
                                                </p>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <p>
                                                    {resume > 0 ? formatWatchTime(resume) : '0:00'}
                                                    {progress > 0 ? ` · ${progress.toFixed(1)}%` : ''}
                                                </p>
                                                {item.last_watched_at ? (
                                                    <p className="text-xs text-zinc-500">
                                                        {new Date(item.last_watched_at).toLocaleString('vi-VN')}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="max-w-[220px] py-3 pr-4">
                                                <Link
                                                    href={href}
                                                    target="_blank"
                                                    className="break-all text-xs text-cyan-400 hover:underline"
                                                >
                                                    {href}
                                                </Link>
                                                {item.watch_url ? (
                                                    <p
                                                        className="mt-1 break-all text-[10px] text-zinc-600"
                                                        title="watch_url từ BE"
                                                    >
                                                        BE: {item.watch_url}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => void onDelete(item)}
                                                        className="text-left text-xs text-red-400 hover:text-red-300"
                                                    >
                                                        Xóa dòng
                                                    </button>
                                                    {item.movie?.id ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => void onDeleteMovie(item)}
                                                            className="text-left text-xs text-zinc-500 hover:text-red-300"
                                                        >
                                                            Xóa cả phim
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

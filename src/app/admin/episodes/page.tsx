'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import PlusIcon from '@/components/icons/PlusIcon';
import PencilIcon from '@/components/icons/PencilIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import { episodeAPI } from '@/lib/api';
import type { AdminEpisode, EpisodesPagination } from '@/types/episode';
import { AdminPagination } from '@/components/admin/admin-pagination';

function AdminEpisodesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const perPage = Math.max(1, parseInt(searchParams.get('per_page') || '15', 10) || 15);

    const [episodes, setEpisodes] = useState<AdminEpisode[]>([]);
    const [pagination, setPagination] = useState<EpisodesPagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEpisodes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await episodeAPI.getEpisodes({ page, per_page: perPage });
            setEpisodes(Array.isArray(res.data) ? res.data : []);
            setPagination(res.pagination ?? null);
        } catch (e) {
            console.error(e);
            setError('Không tải được danh sách tập phim.');
            setEpisodes([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [page, perPage]);

    useEffect(() => {
        fetchEpisodes();
    }, [fetchEpisodes]);

    const deleteEpisode = async (id: number) => {
        if (!confirm('Xóa tập phim này?')) return;
        try {
            await episodeAPI.deleteEpisode(String(id));
            fetchEpisodes();
        } catch (e) {
            console.error(e);
            alert('Không xóa được.');
        }
    };

    const truncateUrl = (url: string, len = 40) => {
        if (!url) return '—';
        return url.length > len ? `${url.slice(0, len)}…` : url;
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-600" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản lý tập phim</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        {pagination ? `${pagination.total} tập — trang ${pagination.current_page}/${pagination.last_page}` : `${episodes.length} tập`}
                    </p>
                </div>
                <Link
                    href="/admin/episodes/new"
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Thêm tập phim
                </Link>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">ID tập</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">ID phim</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Tên</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Slug</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Số tập</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Embed</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {episodes.map((ep) => (
                                <tr key={ep.id} className="transition-colors hover:bg-gray-700/80">
                                    <td className="px-4 py-3 text-sm">
                                        <Link
                                            href={`/admin/episodes/${ep.id}`}
                                            className="font-mono text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            #{ep.id}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <Link
                                            href={`/admin/movies/${ep.movie_id}`}
                                            className="font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
                                        >
                                            #{ep.movie_id}
                                        </Link>
                                    </td>
                                    <td className="max-w-[140px] truncate px-4 py-3 text-sm text-white" title={ep.name}>
                                        {ep.name || '—'}
                                    </td>
                                    <td className="max-w-[120px] truncate px-4 py-3 text-sm text-gray-300">{ep.slug}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{ep.episode_number}</td>
                                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-400" title={ep.embed_url}>
                                        {truncateUrl(ep.embed_url)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/episodes/${ep.id}`}
                                                className="text-blue-500 hover:text-blue-400"
                                                title="Sửa"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => deleteEpisode(ep.id)}
                                                className="text-red-500 hover:text-red-400"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination && pagination.last_page > 1 && (
                <AdminPagination
                    page={pagination.current_page}
                    lastPage={pagination.last_page}
                    perPage={pagination.per_page ?? perPage}
                    onPerPageChange={(n) => {
                        const qs = new URLSearchParams(searchParams.toString());
                        qs.set('per_page', String(n));
                        qs.set('page', '1');
                        router.push(`/admin/episodes?${qs.toString()}`);
                    }}
                    onPageChange={(p) => {
                        const qs = new URLSearchParams(searchParams.toString());
                        qs.set('page', String(p));
                        qs.set('per_page', String(perPage));
                        router.push(`/admin/episodes?${qs.toString()}`);
                    }}
                    rightSlot={
                        <div className="text-sm text-gray-400">
                            Trang {pagination.current_page} / {pagination.last_page}
                        </div>
                    }
                />
            )}
        </div>
    );
}

export default function AdminEpisodesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-64 items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-600" />
                </div>
            }
        >
            <AdminEpisodesContent />
        </Suspense>
    );
}

// Pagination UI dùng chung: `AdminPagination` (không tự call API)

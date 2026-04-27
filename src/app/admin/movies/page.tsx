// app/(admin)/movies/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PlusIcon from '@/components/icons/PlusIcon';
import PencilIcon from '@/components/icons/PencilIcon';
import TrashIcon from '@/components/icons/TrashIcon';

import { Movie } from '@/types/auth';
import MovieDetailModal from '@/components/modal/movie_detail_modal';
import { movieAPI } from '@/lib/api';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { toUserErrorMessage } from '@/lib/api-error';

type MoviesPayload = {
    data: Movie[];
    meta?: { current_page?: number; total?: number; last_page?: number; per_page?: number };
};

function unwrapMovies(raw: unknown): MoviesPayload {
    if (raw && typeof raw === 'object') {
        const o = raw as any;
        if (Array.isArray(o.data)) return { data: o.data, meta: o.meta };
        if (o.data && typeof o.data === 'object' && Array.isArray(o.data.data)) {
            return { data: o.data.data, meta: o.data.meta ?? o.meta };
        }
        if (Array.isArray(o.movies)) return { data: o.movies, meta: o.meta };
    }
    return { data: [] };
}

export default function MoviesPage() {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [meta, setMeta] = useState<MoviesPayload['meta'] | undefined>(undefined);

    // State cho modal
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMovie, setModalMovie] = useState<Movie | null>(null);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await movieAPI.listPaged({ page, per_page: perPage });
            const p = unwrapMovies(raw);
            setMovies(p.data);
            setMeta(p.meta);
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được phim.' }));
            setMovies([]);
            setMeta(undefined);
        } finally {
            setLoading(false);
        }
    }, [page, perPage]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const fetchMovieDetail = async (id: number) => {
        try {
            const data = await movieAPI.getMovie(String(id));
            setModalMovie(data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch movie detail:', error);
        }
    };

    const handleIdClick = (movie: Movie) => {
        // Lưu movie hiện tại để hiển thị nhanh (nếu cần)
        setSelectedMovie(movie);
        // Fetch chi tiết đầy đủ
        fetchMovieDetail(movie.id);
    };

    const deleteMovie = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa phim này?')) return;

        try {
            await movieAPI.deleteMovie(String(id));
            await fetchMovies();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to delete movie:', error);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/admin/movies/${id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Quản lý phim</h2>
                        <p className="text-gray-400 mt-1">
                            {meta?.total ?? movies.length} phim trong hệ thống
                        </p>
                    </div>
                    <Link
                        href="/admin/movies/create"
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Thêm phim
                    </Link>
                </div>

                {error ? (
                    <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
                ) : null}

                {/* Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden w-full">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tên phim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Năm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tập</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lượt xem</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {movies.map((movie: any) => (
                                <tr key={movie.id} className="hover:bg-gray-700 transition-colors">
                                    {/* ID - Clickable */}
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => handleIdClick(movie)}
                                            className="text-blue-500 hover:text-blue-400 hover:underline font-mono focus:outline-none"
                                        >
                                            #{movie.id}
                                        </button>
                                    </td>

                                    {/* Tên phim */}
                                    <td className="px-6 py-4 text-sm text-white">
                                        <div className="flex items-center space-x-3">
                                            {movie.thumb_url && (
                                                <img
                                                    src={movie.thumb_url}
                                                    alt={movie.name}
                                                    className="w-10 h-14 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{movie.name}</div>
                                                <div className="text-gray-400 text-xs">{movie.origin_name}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Năm */}
                                    <td className="px-6 py-4 text-sm text-gray-300">{movie.year}</td>

                                    {/* Tập */}
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {movie.episode_current}/{movie.episode_total}
                                    </td>

                                    {/* Lượt xem */}
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {movie.views?.toLocaleString() || 0}
                                    </td>

                                    {/* Thao tác */}
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleEdit(movie.id)}
                                                className="text-blue-500 hover:text-blue-400 transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteMovie(movie.id)}
                                                className="text-red-500 hover:text-red-400 transition-colors"
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

                {((meta?.last_page ?? 1) > 1) ? (
                    <div className="mt-6">
                        <AdminPagination
                            page={meta?.current_page ?? page}
                            lastPage={meta?.last_page ?? Math.max(1, page)}
                            onPageChange={(p) => setPage(p)}
                            perPage={perPage}
                            onPerPageChange={(n) => {
                                setPerPage(n);
                                setPage(1);
                            }}
                            rightSlot={
                                <div className="text-sm text-gray-400">
                                    Trang {meta?.current_page ?? page}
                                    {meta?.last_page ? ` / ${meta.last_page}` : null}
                                </div>
                            }
                        />
                    </div>
                ) : null}
            </div>

            {/* Movie Detail Modal */}
            <MovieDetailModal
                movie={modalMovie || selectedMovie}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalMovie(null);
                }}
                onEdit={() => modalMovie && handleEdit(modalMovie.id)}
                onDelete={() => modalMovie && deleteMovie(modalMovie.id)}
            />
        </>
    );
}
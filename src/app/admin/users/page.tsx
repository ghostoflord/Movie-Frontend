// app/(admin)/movies/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PlusIcon from '@/components/icons/PlusIcon';
import PencilIcon from '@/components/icons/PencilIcon';
import TrashIcon from '@/components/icons/TrashIcon';


export default function MoviesPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await fetch('/api/admin/movies');
            const data = await res.json();
            setMovies(data);
        } catch (error) {
            console.error('Failed to fetch movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteMovie = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa phim này?')) return;

        try {
            await fetch(`/api/admin/movies/${id}`, { method: 'DELETE' });
            fetchMovies(); // Refresh list
        } catch (error) {
            console.error('Failed to delete movie:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản lý phim</h2>
                    <p className="text-gray-400 mt-1">Danh sách tất cả phim trong hệ thống</p>
                </div>
                <Link
                    href="/admin/movies/create"
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm phim
                </Link>
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Tên phim
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Năm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Tập
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Lượt xem
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {movies.map((movie: any) => (
                            <tr key={movie.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 text-sm text-white">{movie.id}</td>
                                <td className="px-6 py-4 text-sm text-white">{movie.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{movie.year}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {movie.episode_current}/{movie.episode_total}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {movie.views?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            href={`/admin/movies/${movie.id}/edit`}
                                            className="text-blue-500 hover:text-blue-400"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => deleteMovie(movie.id)}
                                            className="text-red-500 hover:text-red-400"
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
    );
}
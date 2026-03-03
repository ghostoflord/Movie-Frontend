// app/(admin)/movies/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PencilIcon from '@/components/icons/PencilIcon';
import TrashIcon from '@/components/icons/TrashIcon';


export default function MovieDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        origin_name: '',
        description: '',
        year: '',
        quality: '',
        episode_current: '',
        episode_total: '',
    });

    useEffect(() => {
        fetchMovie();
    }, [params.id]);

    const fetchMovie = async () => {
        try {
            // Gọi API lấy chi tiết phim
            const res = await fetch(`/api/admin/movies/${params.id}`);
            const data = await res.json();
            setMovie(data);
            setFormData(data);
        } catch (error) {
            console.error('Failed to fetch movie:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/movies/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsEditing(false);
                fetchMovie(); // Refresh data
            }
        } catch (error) {
            console.error('Failed to update movie:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc muốn xóa phim này?')) return;

        try {
            const res = await fetch(`/api/admin/movies/${params.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/admin/movies');
            }
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

    if (!movie) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl text-white">Không tìm thấy phim</h2>
                <Link href="/admin/movies" className="text-red-500 hover:text-red-400 mt-4 inline-block">
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/admin/movies"
                        className="text-gray-400 hover:text-white"
                    >
                        {/* <ArrowLeftIcon className="h-6 w-6" /> */}
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{movie.name}</h2>
                        <p className="text-gray-400 mt-1">{movie.origin_name}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        {isEditing ? 'Hủy' : 'Sửa'}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Xóa
                    </button>
                </div>
            </div>

            {/* Content */}
            {isEditing ? (
                <form onSubmit={handleUpdate} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tên phim
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tên gốc
                            </label>
                            <input
                                type="text"
                                value={formData.origin_name}
                                onChange={(e) => setFormData({ ...formData, origin_name: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Năm
                            </label>
                            <input
                                type="text"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Chất lượng
                            </label>
                            <input
                                type="text"
                                value={formData.quality}
                                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <dl className="grid grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-400">ID</dt>
                            <dd className="mt-1 text-sm text-white">{movie.id}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">Slug</dt>
                            <dd className="mt-1 text-sm text-white">{movie.slug}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">Năm</dt>
                            <dd className="mt-1 text-sm text-white">{movie.year}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">Chất lượng</dt>
                            <dd className="mt-1 text-sm text-white">{movie.quality}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">Tập hiện tại</dt>
                            <dd className="mt-1 text-sm text-white">{movie.episode_current}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-400">Tổng số tập</dt>
                            <dd className="mt-1 text-sm text-white">{movie.episode_total}</dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="text-sm font-medium text-gray-400">Mô tả</dt>
                            <dd className="mt-1 text-sm text-white">{movie.description}</dd>
                        </div>
                    </dl>
                </div>
            )}
        </div>
    );
}
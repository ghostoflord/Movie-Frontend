// app/(admin)/movies/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PencilIcon from '@/components/icons/PencilIcon';
import { AdminBackLink } from '@/components/admin/admin-back-link';
import TrashIcon from '@/components/icons/TrashIcon';
import { actorAPI, movieAPI } from '@/lib/api';
import { Movie } from '@/types/auth';
import type { Actor } from '@/types/admin-entities';
import { resolveUserAvatarUrl } from '@/lib/avatar';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [movieId, setMovieId] = useState<string | null>(null);
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [actorIdsInput, setActorIdsInput] = useState('');
    const [actorBusy, setActorBusy] = useState(false);
    const [actorList, setActorList] = useState<Actor[]>([]);
    const [actorListLoaded, setActorListLoaded] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        origin_name: '',
        description: '',
        year: '',
        quality: '',
        episode_current: '',
        episode_total: '',
    });

    // SỬA: Lấy id từ params Promise
    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setMovieId(resolvedParams.id);
        };

        resolveParams();
    }, [params]);

    useEffect(() => {
        if (movieId) {
            fetchMovie();
        }
    }, [movieId]);

    useEffect(() => {
        if (actorListLoaded) return;
        actorAPI
            .list({ page: 1, per_page: 1000 })
            .then((raw) => {
                const o = raw as any;
                const list: Actor[] =
                    Array.isArray(o?.data) ? o.data : Array.isArray(o?.data?.data) ? o.data.data : Array.isArray(o) ? o : [];
                setActorList(list);
                setActorListLoaded(true);
            })
            .catch(() => {
                setActorList([]);
                setActorListLoaded(true);
            });
    }, [actorListLoaded]);

    const fetchMovie = async () => {
        if (!movieId) return;

        try {
            setLoading(true);
            const data = await movieAPI.getMovie(movieId);
            setMovie(data);
            setFormData({
                name: data.name,
                origin_name: data.origin_name,
                description: data.description.replace(/<[^>]*>/g, ''),
                year: data.year,
                quality: data.quality,
                episode_current: data.episode_current,
                episode_total: data.episode_total,
            });
        } catch (error) {
            console.error('Failed to fetch movie:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!movieId) return;

        try {
            await movieAPI.updateMovie(movieId, formData);
            setIsEditing(false);
            await fetchMovie();
        } catch (error) {
            console.error('Failed to update movie:', error);
            alert('Có lỗi xảy ra khi cập nhật phim');
        }
    };

    const handleDelete = async () => {
        if (!movieId || !confirm('Bạn có chắc muốn xóa phim này?')) return;

        try {
            await movieAPI.deleteMovie(movieId);
            router.push('/admin/movies');
        } catch (error) {
            console.error('Failed to delete movie:', error);
            alert('Có lỗi xảy ra khi xóa phim');
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
                <div className="mt-4 flex justify-center sm:justify-start">
                    <AdminBackLink href="/admin/movies">Quay lại danh sách phim</AdminBackLink>
                </div>
            </div>
        );
    }

    const assignedActors: Actor[] = Array.isArray((movie as any).actors) ? ((movie as any).actors as Actor[]) : [];

    const parseActorIds = (text: string) =>
        text
            .split(/[,\s]+/g)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n) && n > 0);

    const onAssignActors = async () => {
        if (!movieId) return;
        const ids = parseActorIds(actorIdsInput);
        if (ids.length === 0) return;
        setActorBusy(true);
        try {
            await movieAPI.assignActors(movieId, ids);
            setActorIdsInput('');
            await fetchMovie();
        } catch (e) {
            console.error(e);
            alert('Gán diễn viên thất bại.');
        } finally {
            setActorBusy(false);
        }
    };

    const onUnassignActor = async (actorId: number) => {
        if (!movieId) return;
        setActorBusy(true);
        try {
            await movieAPI.unassignActor(movieId, actorId);
            await fetchMovie();
        } catch (e) {
            console.error(e);
            alert('Bỏ gán diễn viên thất bại.');
        } finally {
            setActorBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header với thông tin phim và ảnh */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-start space-x-6">
                    {/* Poster image */}
                    {movie.poster_url && (
                        <img
                            src={movie.poster_url}
                            alt={movie.name}
                            className="w-32 h-48 object-cover rounded-lg"
                        />
                    )}

                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{movie.name}</h2>
                                <p className="text-gray-400 mt-1">{movie.origin_name}</p>
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

                        {/* Status badges */}
                        <div className="flex space-x-2 mt-4">
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                {movie.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                                {movie.quality}
                            </span>
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                                {movie.year}
                            </span>
                        </div>
                    </div>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tập hiện tại
                            </label>
                            <input
                                type="text"
                                value={formData.episode_current}
                                onChange={(e) => setFormData({ ...formData, episode_current: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Tổng số tập
                            </label>
                            <input
                                type="text"
                                value={formData.episode_total}
                                onChange={(e) => setFormData({ ...formData, episode_total: e.target.value })}
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
                <div className="space-y-6">
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
                            <dd className="mt-1 text-sm text-white"
                                dangerouslySetInnerHTML={{ __html: movie.description }} />
                        </div>

                        {/* Hiển thị episodes nếu có */}
                        {movie.episodes && movie.episodes.length > 0 && (
                            <div className="col-span-2">
                                <dt className="text-sm font-medium text-gray-400 mb-2">Tập phim</dt>
                                <dd className="mt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {movie.episodes.map((ep) => (
                                            <span key={ep.id} className="px-3 py-1 bg-gray-700 text-white text-sm rounded">
                                                Tập {ep.episode_number}
                                            </span>
                                        ))}
                                    </div>
                                </dd>
                            </div>
                        )}
                        </dl>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-white">Diễn viên</h3>
                        <p className="mt-1 text-sm text-gray-400">Gán / bỏ gán diễn viên cho phim.</p>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Actor IDs (cách nhau bởi dấu phẩy)</label>
                                <input
                                    value={actorIdsInput}
                                    onChange={(e) => setActorIdsInput(e.target.value)}
                                    placeholder="VD: 10, 12, 99"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={onAssignActors}
                                disabled={actorBusy}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60"
                            >
                                {actorBusy ? 'Đang xử lý…' : 'Gán'}
                            </button>
                        </div>

                        {actorList.length ? (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Chọn nhanh</label>
                                <select
                                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (!v) return;
                                        setActorIdsInput((prev) => (prev ? `${prev}, ${v}` : v));
                                        e.currentTarget.value = '';
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        Chọn diễn viên để thêm…
                                    </option>
                                    {actorList.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            #{a.id} — {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}

                        <div className="mt-5">
                            {assignedActors.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {assignedActors.map((a) => (
                                        <div
                                            key={a.id}
                                            className="flex items-center gap-2 rounded-full border border-gray-600 bg-gray-700/60 px-3 py-1.5 text-sm text-white"
                                        >
                                            {a.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={resolveUserAvatarUrl(a.avatar) ?? ''}
                                                    alt=""
                                                    className="h-6 w-6 rounded-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : null}
                                            <span className="max-w-[220px] truncate">
                                                #{a.id} {a.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUnassignActor(a.id)}
                                                disabled={actorBusy}
                                                className="ml-1 rounded-full bg-red-600/20 px-2 py-0.5 text-xs text-red-200 hover:bg-red-600/30 disabled:opacity-60"
                                            >
                                                Bỏ
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Chưa gán diễn viên nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
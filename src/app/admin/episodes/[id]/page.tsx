'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminBackLink } from '@/components/admin/admin-back-link';
import { episodeAPI } from '@/lib/api';
import { unwrapData } from '@/lib/unwrap-api';
import type { AdminEpisode } from '@/types/episode';
import TrashIcon from '@/components/icons/TrashIcon';

export default function AdminEpisodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [episode, setEpisode] = useState<AdminEpisode | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        movie_id: '',
        name: '',
        slug: '',
        embed_url: '',
        episode_number: '',
    });

    const fetchEpisode = async () => {
        try {
            setLoading(true);
            const raw = await episodeAPI.getEpisode(id);
            const data = unwrapData<AdminEpisode>(raw as AdminEpisode | { data: AdminEpisode });
            if (!data) {
                setEpisode(null);
                return;
            }
            setEpisode(data);
            setForm({
                movie_id: String(data.movie_id),
                name: data.name ?? '',
                slug: data.slug ?? '',
                embed_url: data.embed_url ?? '',
                episode_number: String(data.episode_number ?? ''),
            });
        } catch (e) {
            console.error(e);
            setEpisode(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchEpisode();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await episodeAPI.updateEpisode(id, {
                movie_id: parseInt(form.movie_id, 10),
                name: form.name,
                slug: form.slug,
                embed_url: form.embed_url,
                episode_number: parseInt(form.episode_number, 10) || 0,
            });
            await fetchEpisode();
            alert('Đã cập nhật tập phim.');
        } catch (err) {
            console.error(err);
            alert('Cập nhật thất bại.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Xóa tập phim này?')) return;
        try {
            await episodeAPI.deleteEpisode(id);
            router.push('/admin/episodes');
        } catch (e) {
            console.error(e);
            alert('Không xóa được.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-600" />
            </div>
        );
    }

    if (!episode) {
        return (
            <div className="py-12 text-center">
                <h2 className="text-2xl text-white">Không tìm thấy tập phim</h2>
                <div className="mt-4 flex justify-center sm:justify-start">
                    <AdminBackLink href="/admin/episodes">Danh sách tập phim</AdminBackLink>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tập #{episode.id}</h1>
                    <p className="text-sm text-gray-500">
                        Tạo: {new Date(episode.created_at).toLocaleString('vi-VN')} · Cập nhật:{' '}
                        {new Date(episode.updated_at).toLocaleString('vi-VN')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
                >
                    <TrashIcon className="h-4 w-4" />
                    Xóa
                </button>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                <div className="mb-6 flex flex-wrap gap-4 text-sm">
                    <Link
                        href={`/admin/movies/${episode.movie_id}`}
                        className="rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-300 hover:bg-emerald-500/25"
                    >
                        Xem phim #{episode.movie_id} →
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">ID phim (movie_id)</label>
                        <input
                            type="number"
                            required
                            min={1}
                            value={form.movie_id}
                            onChange={(e) => setForm({ ...form, movie_id: e.target.value })}
                            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Tên tập</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                            placeholder="VD: 1, Full, Trailer"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Slug</label>
                        <input
                            type="text"
                            required
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                            placeholder="tap-1"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">Số tập</label>
                        <input
                            type="number"
                            required
                            min={0}
                            value={form.episode_number}
                            onChange={(e) => setForm({ ...form, episode_number: e.target.value })}
                            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">URL embed</label>
                        <textarea
                            value={form.embed_url}
                            onChange={(e) => setForm({ ...form, embed_url: e.target.value })}
                            rows={3}
                            className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="flex flex-col gap-4 border-t border-gray-700 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <AdminBackLink href="/admin/episodes">Danh sách tập phim</AdminBackLink>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 sm:w-auto sm:min-w-[160px] sm:px-6"
                        >
                            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

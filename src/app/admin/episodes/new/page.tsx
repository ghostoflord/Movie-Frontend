'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { episodeAPI } from '@/lib/api';
import { unwrapData } from '@/lib/unwrap-api';
import type { AdminEpisode } from '@/types/episode';

export default function AdminEpisodeCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        movie_id: '',
        name: '',
        slug: 'tap-1',
        embed_url: '',
        episode_number: '1',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const raw = await episodeAPI.createEpisode({
                movie_id: parseInt(form.movie_id, 10),
                name: form.name,
                slug: form.slug,
                embed_url: form.embed_url,
                episode_number: parseInt(form.episode_number, 10) || 0,
            });
            const created = unwrapData<AdminEpisode>(raw as AdminEpisode | { data: AdminEpisode });
            const newId = created?.id ?? (raw as AdminEpisode)?.id;
            if (newId) {
                router.push(`/admin/episodes/${newId}`);
            } else {
                router.push('/admin/episodes');
            }
        } catch (err) {
            console.error(err);
            alert('Tạo tập phim thất bại. Kiểm tra movie_id và dữ liệu.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <Link href="/admin/episodes" className="text-sm text-gray-400 hover:text-white">
                    ← Danh sách tập phim
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-white">Thêm tập phim</h1>
                <p className="text-sm text-gray-500">Gán vào phim bằng ID phim (movie_id)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-700 bg-gray-800 p-6">
                <div>
                    <label className="mb-1 block text-sm text-gray-400">ID phim (movie_id) *</label>
                    <input
                        type="number"
                        required
                        min={1}
                        value={form.movie_id}
                        onChange={(e) => setForm({ ...form, movie_id: e.target.value })}
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                        placeholder="VD: 12"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-gray-400">Tên tập</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-gray-400">Slug *</label>
                    <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-gray-400">Số tập *</label>
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
                    />
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                    {saving ? 'Đang tạo…' : 'Tạo tập phim'}
                </button>
            </form>
        </div>
    );
}

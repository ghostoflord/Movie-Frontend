'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { movieAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';

export default function AdminMovieCreatePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        origin_name: '',
        slug: '',
        thumb_url: '',
        poster_url: '',
        description: '',
        year: '',
        quality: 'HD',
        language: '',
        status: 'trailer',
        episode_current: 'Trailer',
        episode_total: '1',
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await movieAPI.createMovie({
                name: form.name,
                origin_name: form.origin_name,
                slug: form.slug,
                thumb_url: form.thumb_url,
                poster_url: form.poster_url,
                description: form.description,
                year: form.year,
                quality: form.quality,
                language: form.language || null,
                status: form.status,
                episode_current: form.episode_current,
                episode_total: form.episode_total,
            } as any);
            router.push('/admin/movies');
        } catch (err) {
            alert(
                toUserErrorMessage((err as any)?.response?.data ?? (err as any)?.message, {
                    fallback: 'Tạo phim thất bại.',
                }),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Thêm phim</h1>
            </div>

            <Link href="/admin/movies" className="text-sm text-zinc-400 hover:text-white">
                ← Danh sách phim
            </Link>

            <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Tên phim *">
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Tên gốc">
                        <input
                            value={form.origin_name}
                            onChange={(e) => setForm({ ...form, origin_name: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Slug *">
                        <input
                            required
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Năm">
                        <input
                            value={form.year}
                            onChange={(e) => setForm({ ...form, year: e.target.value })}
                            inputMode="numeric"
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Thumb URL">
                        <input
                            value={form.thumb_url}
                            onChange={(e) => setForm({ ...form, thumb_url: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Poster URL">
                        <input
                            value={form.poster_url}
                            onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Chất lượng">
                        <input
                            value={form.quality}
                            onChange={(e) => setForm({ ...form, quality: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Ngôn ngữ">
                        <input
                            value={form.language}
                            onChange={(e) => setForm({ ...form, language: e.target.value })}
                            placeholder="Vietsub"
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Trạng thái">
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        >
                            <option value="trailer">trailer</option>
                            <option value="ongoing">ongoing</option>
                            <option value="completed">completed</option>
                        </select>
                    </Field>
                    <Field label="Tập hiện tại">
                        <input
                            value={form.episode_current}
                            onChange={(e) => setForm({ ...form, episode_current: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <Field label="Tổng tập">
                        <input
                            value={form.episode_total}
                            onChange={(e) => setForm({ ...form, episode_total: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        />
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Mô tả">
                            <textarea
                                rows={5}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                            />
                        </Field>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {saving ? 'Đang tạo…' : 'Tạo phim'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm text-zinc-400">{label}</label>
            {children}
        </div>
    );
}


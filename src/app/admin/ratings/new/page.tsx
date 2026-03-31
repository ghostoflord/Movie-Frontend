'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ratingAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';

export default function AdminRatingNewPage() {
    const router = useRouter();
    const [movieId, setMovieId] = useState('');
    const [rating, setRating] = useState('10');
    const [saving, setSaving] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await ratingAPI.create({ movie_id: Number(movieId), rating: Number(rating) });
            router.push('/admin/ratings');
        } catch (err) {
            alert(toUserErrorMessage((err as any)?.response?.data ?? (err as any)?.message, { fallback: 'Tạo rating thất bại.' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Thêm rating" />
            <Link href="/admin/ratings" className="text-sm text-zinc-400 hover:text-white">
                ← Danh sách ratings
            </Link>

            <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Movie ID *</label>
                    <input
                        value={movieId}
                        onChange={(e) => setMovieId(e.target.value)}
                        required
                        inputMode="numeric"
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Rating (1..10) *</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {saving ? 'Đang tạo…' : 'Tạo'}
                    </button>
                </div>
            </form>
        </div>
    );
}


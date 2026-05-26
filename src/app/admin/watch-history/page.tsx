'use client';

import { useState } from 'react';
import { watchHistoryAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';

export default function AdminWatchHistoryPage() {
    const [episodeId, setEpisodeId] = useState('');
    const [currentTime, setCurrentTime] = useState('0');
    const [duration, setDuration] = useState('');
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setResult(null);
        try {
            await watchHistoryAPI.saveProgress({
                episode_id: Number(episodeId),
                current_time: Number(currentTime) || 0,
                ...(duration.trim() ? { duration_watched: Number(duration) } : {}),
            });
            setResult('Đã lưu tiến độ xem.');
        } catch (err) {
            setResult(
                toUserErrorMessage((err as { response?: { data?: unknown } })?.response?.data ?? err, {
                    fallback: 'Không lưu được tiến độ xem. Vui lòng thử lại.',
                }),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Watch history"
                subtitle="Test POST /api/watch-history (upsert theo user + episode)."
            />

            <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Episode ID *</label>
                    <input
                        value={episodeId}
                        onChange={(e) => setEpisodeId(e.target.value)}
                        required
                        inputMode="numeric"
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Current time (giây) *</label>
                    <input
                        value={currentTime}
                        onChange={(e) => setCurrentTime(e.target.value)}
                        required
                        inputMode="numeric"
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Duration watched (giây, tùy chọn)</label>
                    <input
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        inputMode="numeric"
                        placeholder="Bỏ trống = BE mặc định 0"
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {saving ? 'Đang lưu…' : 'Lưu tiến độ'}
                    </button>
                    {result ? <p className="text-sm text-zinc-300">{result}</p> : null}
                </div>
            </form>
        </div>
    );
}

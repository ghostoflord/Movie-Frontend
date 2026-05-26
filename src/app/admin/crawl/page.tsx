'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { categoryAPI, crawlAPI, type CrawlStatus } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { parseCrawlCategories, type CrawlCategoryOption } from '@/lib/crawl-categories';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

function statusBadge(s: string) {
    const v = (s || 'idle').toLowerCase();
    if (v === 'processing') return 'bg-amber-500/15 text-amber-200';
    if (v === 'done') return 'bg-emerald-600/15 text-emerald-200';
    if (v === 'failed') return 'bg-red-600/15 text-red-200';
    return 'bg-zinc-700/25 text-zinc-200';
}

export default function AdminCrawlPage() {
    const [status, setStatus] = useState<CrawlStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [categories, setCategories] = useState<CrawlCategoryOption[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    const [category, setCategory] = useState('');
    const [pages, setPages] = useState('3');
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [submittingMovies, setSubmittingMovies] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const s = await crawlAPI.status();
            setStatus(s);
        } catch (e) {
            setStatus(null);
            setError(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Không lấy được trạng thái crawl.',
                }),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        setCategoriesLoading(true);
        setCategoriesError(null);
        try {
            const raw = await categoryAPI.listForCrawl();
            const list = parseCrawlCategories(raw);
            setCategories(list);
            setCategory((prev) => {
                if (prev && list.some((c) => c.slug === prev)) return prev;
                return list[0]?.slug ?? '';
            });
        } catch (e) {
            setCategories([]);
            setCategoriesError(
                toUserErrorMessage((e as { response?: { data?: unknown } })?.response?.data ?? e, {
                    fallback: 'Không tải được danh sách thể loại.',
                }),
            );
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchStatus();
        void fetchCategories();
    }, [fetchStatus, fetchCategories]);

    useEffect(() => {
        const s = (status?.status || '').toLowerCase();
        if (s !== 'processing') return;
        const t = setInterval(() => {
            void fetchStatus();
        }, 2500);
        return () => clearInterval(t);
    }, [status?.status, fetchStatus]);

    const selectedCategory = useMemo(
        () => categories.find((c) => c.slug === category),
        [categories, category],
    );

    const startedAt = useMemo(() => {
        if (!status?.started_at) return '—';
        try {
            return new Date(status.started_at).toLocaleString('vi-VN');
        } catch {
            return status.started_at;
        }
    }, [status?.started_at]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const slug = category.trim();
        if (!slug) {
            setError('Vui lòng chọn thể loại (slug).');
            return;
        }
        setSubmitting(true);
        setNotice(null);
        setError(null);
        try {
            const p = Math.max(1, Math.min(20, parseInt(pages || '3', 10) || 3));
            const res = (await crawlAPI.crawlCategory({ category: slug, pages: p })) as {
                message?: string;
            };
            const label = selectedCategory?.label ?? slug;
            setNotice(
                typeof res?.message === 'string'
                    ? res.message
                    : `Đã bắt đầu crawl thể loại «${label}» (${slug}) với ${p} trang.`,
            );
            await fetchStatus();
        } catch (err) {
            setError(
                toUserErrorMessage((err as { response?: { data?: unknown } })?.response?.data ?? err, {
                    fallback: 'Không bắt đầu được crawl.',
                }),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const onCrawlMovies = async () => {
        setSubmittingMovies(true);
        setNotice(null);
        setError(null);
        try {
            const p = Math.max(1, Math.min(20, parseInt(pages || '3', 10) || 3));
            const res = (await crawlAPI.crawlMovies({ pages: p })) as { message?: string };
            setNotice(typeof res?.message === 'string' ? res.message : 'Đã bắt đầu crawl phim mới cập nhật.');
            await fetchStatus();
        } catch (err) {
            setError(
                toUserErrorMessage((err as { response?: { data?: unknown } })?.response?.data ?? err, {
                    fallback: 'Không bắt đầu được crawl movies.',
                }),
            );
        } finally {
            setSubmittingMovies(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            </div>
        );
    }
    if (error && !status) return <AdminErrorBox message={error} />;

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Cào phim (Crawler)"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                        Bắt đầu crawl theo thể loại
                    </h2>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm text-zinc-400">Thể loại *</label>
                            {categoriesLoading ? (
                                <p className="text-sm text-zinc-500">Đang tải thể loại từ API…</p>
                            ) : categories.length === 0 ? (
                                <p className="text-sm text-amber-300/90">
                                    Chưa có thể loại trong DB. Tạo thể loại trước hoặc kiểm tra API{' '}
                                    <code className="text-zinc-400">/categories</code>.
                                </p>
                            ) : (
                                <>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                                    >
                                        <option value="">— Chọn thể loại —</option>
                                        {categories.map((c) => (
                                            <option key={c.slug} value={c.slug}>
                                                {c.label}
                                                {c.movies_count != null ? ` (${c.movies_count} phim)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                            {categoriesError ? (
                                <p className="mt-2 text-sm text-red-300">{categoriesError}</p>
                            ) : null}
                            {categories.length > 0 ? (
                                <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-white/5 bg-black/20 p-2">
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((c) => (
                                            <button
                                                key={c.slug}
                                                type="button"
                                                onClick={() => setCategory(c.slug)}
                                                className={[
                                                    'rounded-full border px-3 py-1 text-xs transition',
                                                    category === c.slug
                                                        ? 'border-red-500/50 bg-red-600/20 text-red-100'
                                                        : 'border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10',
                                                ].join(' ')}
                                            >
                                                {c.label}
                                                {c.movies_count != null ? (
                                                    <span className="ml-1 text-zinc-500">({c.movies_count})</span>
                                                ) : null}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-zinc-400">Số trang (1..20)</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={pages}
                                onChange={(e) => setPages(e.target.value)}
                                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="submit"
                                disabled={submitting || categoriesLoading || !category.trim()}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                {submitting ? 'Đang gửi…' : 'Bắt đầu crawl'}
                            </button>
                            <button
                                type="button"
                                disabled={submittingMovies}
                                onClick={() => void onCrawlMovies()}
                                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                            >
                                {submittingMovies ? 'Đang gửi…' : 'Crawl phim mới cập nhật'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    void fetchStatus();
                                    void fetchCategories();
                                }}
                                className="rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
                            >
                                Refresh
                            </button>
                            {notice ? <p className="w-full text-sm text-emerald-300">{notice}</p> : null}
                            {error ? <p className="w-full text-sm text-red-200">{error}</p> : null}
                        </div>
                    </form>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Trạng thái</h2>
                    <div className="space-y-3 text-sm text-zinc-200">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-zinc-400">Status</span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(status?.status || 'idle')}`}
                            >
                                {status?.status || 'idle'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-zinc-400">Started at</span>
                            <span className="text-zinc-200">{startedAt}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-zinc-400">Pages</span>
                            <span className="text-zinc-200">{status?.pages ?? '—'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-zinc-400">Thể loại (slug)</span>
                            <span className="font-mono text-zinc-200">{status?.category ?? '—'}</span>
                        </div>
                        {status?.message ? (
                            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-zinc-300">
                                {status.message}
                            </div>
                        ) : null}
                        <p className="text-xs text-zinc-500">
                            Tip: Khi status = <span className="text-amber-200">processing</span>, trang sẽ tự refresh
                            mỗi 2.5s. Nút xanh «Crawl phim mới cập nhật» không theo thể loại — chỉ job tổng hợp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

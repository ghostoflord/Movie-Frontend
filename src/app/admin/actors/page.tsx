'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { actorAPI } from '@/lib/api';
import type { Actor } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';
import { resolveUserAvatarUrl } from '@/lib/avatar';
import { AdminPagination } from '@/components/admin/admin-pagination';

type ActorsPayload = {
    data: Actor[];
    meta?: { current_page?: number; total?: number; last_page?: number; per_page?: number };
};

function unwrapActors(raw: unknown): ActorsPayload {
    if (raw && typeof raw === 'object') {
        const o = raw as any;
        if (Array.isArray(o.data)) return { data: o.data, meta: o.meta };
        if (o.data && typeof o.data === 'object' && Array.isArray(o.data.data)) {
            return { data: o.data.data, meta: o.data.meta ?? o.meta };
        }
        if (Array.isArray(o.actors)) return { data: o.actors, meta: o.meta };
    }
    return { data: [] };
}

export default function AdminActorsPage() {
    const [items, setItems] = useState<Actor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<ActorsPayload['meta'] | undefined>(undefined);
    const [perPage, setPerPage] = useState(10);
    const [nameQuery, setNameQuery] = useState('');
    const [appliedName, setAppliedName] = useState('');

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await actorAPI.list({
                page,
                per_page: perPage,
                ...(appliedName ? { name: appliedName } : {}),
            });
            const p = unwrapActors(raw);
            setItems(p.data);
            setMeta(p.meta);
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được diễn viên.' }));
            setItems([]);
            setMeta(undefined);
        } finally {
            setLoading(false);
        }
    }, [page, appliedName, perPage]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const subtitle = useMemo(() => {
        const total = meta?.total ?? items.length;
        const pageLabel = meta?.current_page ? `Trang ${meta.current_page}` : `Trang ${page}`;
        return [pageLabel, `${total} diễn viên`].filter(Boolean).join(' · ');
    }, [meta, items.length, page]);

    const lastPage = meta?.last_page ?? Math.max(1, page);

    const onDelete = async (id: number) => {
        if (!confirm('Xóa diễn viên này?')) return;
        try {
            await actorAPI.delete(id);
            await fetchList();
        } catch (e) {
            alert(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Xóa thất bại.' }));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            </div>
        );
    }
    if (error) return <AdminErrorBox message={error} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Diễn viên</h1>
                    <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                    <div className="w-full sm:w-[360px]">
                        <label className="sr-only" htmlFor="actor-name-search">
                            Tìm diễn viên
                        </label>
                        <div className="relative">
                            <input
                                id="actor-name-search"
                                value={nameQuery}
                                onChange={(e) => setNameQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setAppliedName(nameQuery.trim());
                                        setPage(1);
                                    }
                                }}
                                placeholder="Tìm theo tên…"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/40 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setAppliedName(nameQuery.trim());
                                    setPage(1);
                                }}
                                className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                                aria-label="Tìm kiếm"
                                title="Tìm kiếm"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            {nameQuery.trim() ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNameQuery('');
                                        setAppliedName('');
                                        setPage(1);
                                    }}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                                    aria-label="Xóa"
                                    title="Xóa"
                                >
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <Link
                        href="/admin/actors/new"
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Thêm diễn viên
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <table className="w-full">
                    <thead className="bg-zinc-900">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Tên</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Ảnh</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((a) => (
                            <tr key={a.id} className="text-sm text-zinc-200 hover:bg-white/[0.03]">
                                <td className="px-4 py-3 font-mono text-zinc-400">#{a.id}</td>
                                <td className="px-4 py-3">{a.name}</td>
                                <td className="px-4 py-3 text-zinc-400">{a.slug || '—'}</td>
                                <td className="px-4 py-3">
                                    {a.avatar || a.thumb_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={resolveUserAvatarUrl(a.avatar) ?? a.thumb_url ?? ''}
                                            alt=""
                                            className="h-10 w-10 rounded object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <span className="text-zinc-500">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/actors/${a.id}`}
                                            className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600/30"
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(a.id)}
                                            className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-600/30"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500">
                                    Không có diễn viên.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 ? (
                <AdminPagination
                    page={meta?.current_page ?? page}
                    lastPage={lastPage}
                    onPageChange={(p) => setPage(p)}
                    perPage={perPage}
                    onPerPageChange={(n) => {
                        setPerPage(n);
                        setPage(1);
                    }}
                    rightSlot={
                        <div className="text-sm text-zinc-500">
                            Trang {meta?.current_page ?? page}
                            {meta?.last_page ? ` / ${meta.last_page}` : null}
                        </div>
                    }
                />
            ) : null}
        </div>
    );
}


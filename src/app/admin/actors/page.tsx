'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { actorAPI } from '@/lib/api';
import type { Actor } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

export default function AdminActorsPage() {
    const [items, setItems] = useState<Actor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await actorAPI.list();
            setItems(list);
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được diễn viên.' }));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

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
            <AdminPageHeader
                title="Diễn viên"
                subtitle={`${items.length} diễn viên`}
                actionHref="/admin/actors/new"
                actionLabel="Thêm diễn viên"
            />

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
                                    {a.thumb_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={a.thumb_url} alt="" className="h-10 w-10 rounded object-cover" />
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
                    </tbody>
                </table>
            </div>
        </div>
    );
}


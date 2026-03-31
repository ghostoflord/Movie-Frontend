'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { serverAPI } from '@/lib/api';
import type { Server } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

export default function AdminServersPage() {
    const [items, setItems] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await serverAPI.list();
            setItems(list);
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được servers.' }));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const onDelete = async (id: number) => {
        if (!confirm('Xóa server này?')) return;
        try {
            await serverAPI.delete(id);
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
            <AdminPageHeader title="Servers" subtitle={`${items.length} servers`} actionHref="/admin/servers/new" actionLabel="Thêm server" />

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <table className="w-full">
                    <thead className="bg-zinc-900">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Tên</th>
                            <th className="px-4 py-3">Base URL</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((s) => (
                            <tr key={s.id} className="text-sm text-zinc-200 hover:bg-white/[0.03]">
                                <td className="px-4 py-3 font-mono text-zinc-400">#{s.id}</td>
                                <td className="px-4 py-3">{s.name}</td>
                                <td className="px-4 py-3 text-zinc-400">{s.base_url || '—'}</td>
                                <td className="px-4 py-3">{s.is_active ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/servers/${s.id}`}
                                            className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600/30"
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(s.id)}
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


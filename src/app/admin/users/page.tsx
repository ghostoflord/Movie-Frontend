'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminUserAPI } from '@/lib/api';
import type { AdminUserItem } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

type UsersPayload = {
    data: AdminUserItem[];
    meta?: { current_page?: number; total?: number; last_page?: number; per_page?: number };
};

function unwrapUsers(raw: unknown): UsersPayload {
    if (raw && typeof raw === 'object') {
        const o = raw as any;
        if (Array.isArray(o.data)) return { data: o.data, meta: o.meta };
        if (o.data && typeof o.data === 'object' && Array.isArray(o.data.data)) {
            return { data: o.data.data, meta: o.data.meta ?? o.meta };
        }
        if (Array.isArray(o.users)) return { data: o.users, meta: o.meta };
    }
    return { data: [] };
}

export default function AdminUsersPage() {
    const [items, setItems] = useState<AdminUserItem[]>([]);
    const [meta, setMeta] = useState<UsersPayload['meta'] | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await adminUserAPI.list();
            const p = unwrapUsers(raw);
            setItems(p.data);
            setMeta(p.meta);
        } catch (e) {
            setError(
                toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, {
                    fallback: 'Không tải được danh sách user.',
                }),
            );
            setItems([]);
            setMeta(undefined);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const subtitle = useMemo(() => {
        const total = meta?.total ?? items.length;
        const page = meta?.current_page ? `Trang ${meta.current_page}` : null;
        return [page, `${total} user`].filter(Boolean).join(' · ');
    }, [meta, items.length]);

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            </div>
        );
    }
    if (error) return <AdminErrorBox message={error} />;

    const onDelete = async (id: number) => {
        if (!confirm('Xóa user này?')) return;
        try {
            await adminUserAPI.delete(id);
            await fetchList();
        } catch (e) {
            alert(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Xóa thất bại.' }));
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Quản lý user" subtitle={subtitle} actionHref="/admin/users/new" actionLabel="Thêm user" />

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <table className="w-full">
                    <thead className="bg-zinc-900">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Tên</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((u) => (
                            <tr key={u.id} className="text-sm text-zinc-200 hover:bg-white/[0.03]">
                                <td className="px-4 py-3 font-mono text-zinc-400">#{u.id}</td>
                                <td className="px-4 py-3">{u.name}</td>
                                <td className="px-4 py-3 text-zinc-300">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded bg-blue-600/15 px-2 py-1 text-xs font-semibold text-blue-200">
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={[
                                            'rounded px-2 py-1 text-xs font-semibold',
                                            u.active ? 'bg-emerald-600/15 text-emerald-200' : 'bg-zinc-700/30 text-zinc-300',
                                        ].join(' ')}
                                    >
                                        {u.active ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-400">{u.provider}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/users/${u.id}`}
                                            className="rounded-lg bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600/30"
                                        >
                                            Sửa
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => void onDelete(u.id)}
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
                                <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-500">
                                    Không có user.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
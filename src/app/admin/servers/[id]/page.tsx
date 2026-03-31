'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { serverAPI } from '@/lib/api';
import type { Server } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';

export default function AdminServerEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [item, setItem] = useState<Server | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        (async () => {
            const p = await params;
            setId(p.id);
        })();
    }, [params]);

    const fetchOne = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const s = await serverAPI.get(id);
            if (!s) {
                setError('Không tìm thấy server.');
                setItem(null);
            } else {
                setItem(s);
                setName(s.name || '');
                setSlug(s.slug || '');
                setBaseUrl(s.base_url || '');
                setIsActive(!!s.is_active);
            }
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được server.' }));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOne();
    }, [fetchOne]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            await serverAPI.update(id, { name, slug: slug || null, base_url: baseUrl || null, is_active: isActive ? 1 : 0 });
            router.push('/admin/servers');
        } catch (e) {
            alert(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Cập nhật thất bại.' }));
        } finally {
            setSaving(false);
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
    if (!item) return <p className="text-zinc-500">Không có dữ liệu.</p>;

    return (
        <div className="space-y-6">
            <AdminPageHeader title={`Sửa server #${item.id}`} />
            <Link href="/admin/servers" className="text-sm text-zinc-400 hover:text-white">
                ← Danh sách servers
            </Link>

            <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Tên *</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Slug</label>
                    <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-zinc-400">Base URL</label>
                    <input
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active
                </label>

                <div className="flex justify-end">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {saving ? 'Đang lưu…' : 'Lưu'}
                    </button>
                </div>
            </form>
        </div>
    );
}


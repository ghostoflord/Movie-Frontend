'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { serverAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';

export default function AdminServerNewPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await serverAPI.create({
                name,
                slug: slug || undefined,
                base_url: baseUrl || undefined,
                is_active: isActive ? 1 : 0,
            });
            router.push('/admin/servers');
        } catch (err) {
            alert(toUserErrorMessage((err as any)?.response?.data ?? (err as any)?.message, { fallback: 'Tạo server thất bại.' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Thêm server" />
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
                        {saving ? 'Đang tạo…' : 'Tạo'}
                    </button>
                </div>
            </form>
        </div>
    );
}


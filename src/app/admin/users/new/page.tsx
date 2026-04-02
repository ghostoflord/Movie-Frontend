'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminUserAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';

export default function AdminUserNewPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        active: true,
        gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminUserAPI.create({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                active: form.active,
                gender: form.gender || null,
            });
            router.push('/admin/users');
        } catch (err) {
            alert(toUserErrorMessage((err as any)?.response?.data ?? (err as any)?.message, { fallback: 'Tạo user thất bại.' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Thêm user" />
            <Link href="/admin/users" className="text-sm text-zinc-400 hover:text-white">
                ← Danh sách user
            </Link>

            <form onSubmit={onSubmit} className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <Field label="Tên *">
                    <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>
                <Field label="Email *">
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>
                <Field label="Password *">
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Role">
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </Field>
                    <Field label="Active">
                        <label className="flex items-center gap-2 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                            />
                            {form.active ? 'Đang hoạt động' : 'Tạm khóa'}
                        </label>
                    </Field>
                </div>

                <Field label="Gender">
                    <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    >
                        <option value="">—</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </Field>

                <div className="flex justify-end">
                    <button
                        disabled={saving}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {saving ? 'Đang tạo…' : 'Tạo user'}
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


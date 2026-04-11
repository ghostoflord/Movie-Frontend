'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminUserAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { UserAvatarInput } from '@/components/admin/user-avatar-input';

export default function AdminUserNewPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
            await adminUserAPI.create(
                {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    active: form.active,
                    gender: form.gender || null,
                },
                avatarFile,
            );
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

            <form onSubmit={onSubmit} className="w-full max-w-none rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <Field label="Tên" required>
                    <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>
                <Field label="Email" required>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>
                <Field label="Password" required>
                    <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>

                <UserAvatarInput onFileChange={setAvatarFile} />

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
                    <label className="flex min-h-[42px] items-center gap-2 text-sm text-zinc-300">
                        <input
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => setForm({ ...form, active: e.target.checked })}
                        />
                        {form.active ? 'Đang hoạt động' : 'Tạm khóa'}
                    </label>
                </Field>

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

                <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-600/80 bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                    >
                        <span className="text-base leading-none text-zinc-400" aria-hidden>
                            ←
                        </span>
                        Danh sách user
                    </Link>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {saving ? 'Đang tạo…' : 'Tạo user'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm text-zinc-400">
                {label}
                {required ? (
                    <span className="ml-0.5 font-semibold text-[#e50914]" aria-hidden>
                        *
                    </span>
                ) : null}
            </label>
            {children}
        </div>
    );
}


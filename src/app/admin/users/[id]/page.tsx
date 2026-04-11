'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminUserAPI } from '@/lib/api';
import type { AdminUserItem } from '@/types/admin-entities';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { AdminErrorBox } from '@/components/admin/admin-error';
import { UserAvatarInput } from '@/components/admin/user-avatar-input';

export default function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [item, setItem] = useState<AdminUserItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('USER');
    const [active, setActive] = useState(true);
    const [gender, setGender] = useState<'' | 'MALE' | 'FEMALE' | 'OTHER'>('');
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
            const u = await adminUserAPI.get(id);
            if (!u) {
                setError('Không tìm thấy user.');
                setItem(null);
            } else {
                setItem(u);
                setName(u.name || '');
                setEmail(u.email || '');
                setRole(u.role || 'USER');
                setActive(!!u.active);
                setGender((u.gender as any) || '');
            }
        } catch (e) {
            setError(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Không tải được user.' }));
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
            await adminUserAPI.update(
                id,
                {
                    name,
                    email,
                    role,
                    active,
                    gender: gender || null,
                    ...(password ? { password } : {}),
                },
                avatarFile,
            );
            router.push('/admin/users');
        } catch (e) {
            alert(toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, { fallback: 'Cập nhật thất bại.' }));
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!id || !confirm('Xóa user này?')) return;
        try {
            await adminUserAPI.delete(id);
            router.push('/admin/users');
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
    if (!item) return <p className="text-zinc-500">Không có dữ liệu.</p>;

    return (
        <div className="space-y-6">
            <AdminPageHeader title={`Sửa user #${item.id}`} />

            <form onSubmit={onSubmit} className="w-full max-w-none rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                <Field label="Tên" required>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>
                <Field label="Email" required>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </Field>

                <UserAvatarInput existingAvatarPath={item.avatar} onFileChange={setAvatarFile} />

                <Field label="Role">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </Field>
                <Field label="Active">
                    <label className="flex min-h-[42px] items-center gap-2 text-sm text-zinc-300">
                        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                        {active ? 'Đang hoạt động' : 'Tạm khóa'}
                    </label>
                </Field>

                <Field label="Gender">
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    >
                        <option value="">—</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </Field>

                <Field label="Password (để trống nếu không đổi)">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
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
                            type="button"
                            onClick={() => void onDelete()}
                            className="rounded-xl bg-red-600/20 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-600/30"
                        >
                            Xóa user
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {saving ? 'Đang lưu…' : 'Lưu'}
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


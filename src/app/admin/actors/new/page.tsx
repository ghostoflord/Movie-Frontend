'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actorAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import { AdminBackLink } from '@/components/admin/admin-back-link';
import { AdminPageHeader } from '@/components/admin/admin-shell';
import { UserAvatarInput } from '@/components/admin/user-avatar-input';

export default function AdminActorNewPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await actorAPI.create(
                { name, slug: slug || undefined, bio: bio || undefined },
                avatarFile,
            );
            router.push('/admin/actors');
        } catch (err) {
            alert(toUserErrorMessage((err as any)?.response?.data ?? (err as any)?.message, { fallback: 'Tạo diễn viên thất bại.' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Thêm diễn viên" />

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
                    <label className="mb-1 block text-sm text-zinc-400">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-2.5 text-white outline-none focus:border-red-500"
                    />
                </div>

                <UserAvatarInput onFileChange={setAvatarFile} />

                <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <AdminBackLink href="/admin/actors">Danh sách diễn viên</AdminBackLink>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {saving ? 'Đang tạo…' : 'Tạo'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}


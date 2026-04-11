'use client';

import { useEffect, useId, useState } from 'react';
import { resolveUserAvatarUrl } from '@/lib/avatar';

type Props = {
    /** Đường dẫn từ API (vd: avatars/xxx.webp) */
    existingAvatarPath?: string | null;
    onFileChange: (file: File | null) => void;
};

export function UserAvatarInput({ existingAvatarPath, onFileChange }: Props) {
    const inputId = useId();
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    const existingUrl = existingAvatarPath ? resolveUserAvatarUrl(existingAvatarPath) : null;
    const displayUrl = blobUrl || existingUrl;

    return (
        <div className="space-y-2">
            <label htmlFor={inputId} className="block text-sm text-zinc-400">
                Ảnh đại diện
            </label>
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                    {displayUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={displayUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">Chưa có</div>
                    )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <input
                        id={inputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="w-full max-w-md text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-zinc-600"
                        onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            onFileChange(f);
                            setBlobUrl((prev) => {
                                if (prev) URL.revokeObjectURL(prev);
                                return f ? URL.createObjectURL(f) : null;
                            });
                        }}
                    />
                </div>  
            </div>
        </div>
    );
}

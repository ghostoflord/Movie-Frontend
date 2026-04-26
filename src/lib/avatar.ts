/**
 * Laravel thường lưu đường dẫn tương đối (vd: avatars/xxx.webp) và serve qua /storage/...
 */
export function resolveUserAvatarUrl(avatar: string | null | undefined): string | null {
    if (!avatar || !String(avatar).trim()) return null;
    const raw = String(avatar).trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

    const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
    if (!base) return null;

    const path = raw.replace(/^\/+/, '');
    return `${base}/storage/${path}`;
}

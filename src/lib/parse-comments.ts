import type { PublicMovieComment } from '@/types/public-movie-detail';

function unwrapList(raw: unknown): unknown[] {
    if (!raw || typeof raw !== 'object') return [];
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (o.data && typeof o.data === 'object') {
        const inner = o.data as Record<string, unknown>;
        if (Array.isArray(inner.data)) return inner.data;
    }
    if (Array.isArray(raw)) return raw;
    return [];
}

function parseCommentUser(raw: unknown): PublicMovieComment['user'] {
    if (!raw || typeof raw !== 'object') return null;
    const u = raw as Record<string, unknown>;
    const id = u.id != null ? Number(u.id) : undefined;
    const name = typeof u.name === 'string' ? u.name.trim() : undefined;
    const avatar_url =
        typeof u.avatar_url === 'string'
            ? u.avatar_url.trim() || null
            : typeof u.avatar === 'string'
              ? u.avatar.trim() || null
              : null;
    if (id == null && !name && !avatar_url) return null;
    return { id: Number.isFinite(id) ? id : undefined, name, avatar_url };
}

function parseOneComment(c: unknown): PublicMovieComment | null {
    if (!c || typeof c !== 'object') return null;
    const o = c as Record<string, unknown>;
    const id = Number(o.id);
    const content = typeof o.content === 'string' ? o.content : String(o.content ?? '');
    const created_at = typeof o.created_at === 'string' ? o.created_at : String(o.created_at ?? '');
    if (!Number.isFinite(id) || !content) return null;

    const user = parseCommentUser(o.user);
    const user_id =
        o.user_id != null
            ? Number(o.user_id)
            : user?.id != null
              ? user.id
              : undefined;

    return {
        id,
        content,
        created_at,
        user_id,
        user,
        likes_count: o.likes_count != null ? Number(o.likes_count) : undefined,
        movie_id: o.movie_id != null ? Number(o.movie_id) : undefined,
        episode_id: o.episode_id == null ? null : Number(o.episode_id),
    };
}

/** Parse danh sách comment từ GET /movies/{id}, /movies/{id}/comments hoặc /comments */
export function parseComments(raw: unknown): PublicMovieComment[] {
    return unwrapList(raw)
        .map(parseOneComment)
        .filter((x): x is PublicMovieComment => Boolean(x))
        .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
}

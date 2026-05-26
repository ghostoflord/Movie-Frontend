import type { WatchHistoryItem } from '@/types/watch-history';

/** Giây seek — ưu tiên resume_at từ API continue */
export function getResumeSeconds(item: WatchHistoryItem): number {
    const t = item.resume_at ?? item.current_time ?? 0;
    return Math.max(0, Math.floor(Number(t) || 0));
}

/** Route xem phim trên FE: /phim/{id}?watch=1&episode=…&t=… */
export function buildPhimWatchHref(params: {
    movieId: number;
    episodeId?: number;
    resumeSeconds?: number;
}): string {
    const q = new URLSearchParams();
    q.set('watch', '1');
    if (params.episodeId) q.set('episode', String(params.episodeId));
    const t = params.resumeSeconds ?? 0;
    if (t > 0) q.set('t', String(Math.floor(t)));
    return `/phim/${params.movieId}?${q.toString()}`;
}

function sameOriginWatchPath(watchUrl: string): string | null {
    const trimmed = watchUrl.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('/')) return trimmed;

    try {
        const u = new URL(trimmed);
        const site =
            typeof window !== 'undefined'
                ? window.location.origin
                : (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
        if (site && u.origin === site) {
            return `${u.pathname}${u.search}`;
        }
    } catch {
        return null;
    }
    return null;
}

/**
 * Link «xem tiếp» — khớp route FE (/phim/{id}), kèm ?t= seek.
 * Nếu thiếu id phim/tập mới fallback watch_url từ BE (cùng origin).
 */
export function watchHistoryResumeHref(item: WatchHistoryItem): string {
    const movieId = item.movie?.id ?? item.episode?.movie_id;
    const episodeId = item.episode?.id;
    const resumeSeconds = getResumeSeconds(item);

    if (movieId) {
        return buildPhimWatchHref({
            movieId,
            episodeId,
            resumeSeconds: resumeSeconds > 0 ? resumeSeconds : undefined,
        });
    }

    if (item.watch_url) {
        const path = sameOriginWatchPath(item.watch_url);
        if (path) return path;
    }

    return '/continue';
}

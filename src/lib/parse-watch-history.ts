import type { WatchHistoryEpisode, WatchHistoryItem, WatchHistoryMovie } from '@/types/watch-history';

function parseEpisode(raw: unknown): WatchHistoryEpisode | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    const id = Number(o.id);
    if (!Number.isFinite(id)) return null;
    return {
        id,
        name: o.name != null ? String(o.name) : undefined,
        slug: o.slug != null ? String(o.slug) : undefined,
        episode_number: o.episode_number != null ? Number(o.episode_number) : undefined,
        movie_id: o.movie_id != null ? Number(o.movie_id) : undefined,
    };
}

function parseMovie(raw: unknown): WatchHistoryMovie | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    const id = Number(o.id);
    const name = typeof o.name === 'string' ? o.name : '';
    if (!Number.isFinite(id) || !name) return null;
    return {
        id,
        name,
        slug: o.slug != null ? String(o.slug) : undefined,
        thumb_url: o.thumb_url != null ? String(o.thumb_url) : null,
        poster_url: o.poster_url != null ? String(o.poster_url) : null,
        episode_current: o.episode_current != null ? String(o.episode_current) : null,
        episode_total: o.episode_total != null ? String(o.episode_total) : null,
    };
}

export function parseWatchHistoryItem(raw: unknown): WatchHistoryItem | null {
    if (!raw || typeof raw !== 'object') return null;
    const o = raw as Record<string, unknown>;
    const inner = o.data && typeof o.data === 'object' ? (o.data as Record<string, unknown>) : o;
    const id = Number(inner.id);
    if (!Number.isFinite(id)) return null;
    const current_time = Number(inner.current_time ?? inner.resume_at ?? 0) || 0;
    const resume_at =
        inner.resume_at != null
            ? Number(inner.resume_at)
            : current_time > 0
              ? current_time
              : undefined;

    return {
        id,
        current_time,
        resume_at: resume_at != null && Number.isFinite(resume_at) ? resume_at : undefined,
        duration_watched:
            inner.duration_watched != null ? Number(inner.duration_watched) : undefined,
        progress_percent:
            inner.progress_percent != null ? Number(inner.progress_percent) : undefined,
        episode_label:
            typeof inner.episode_label === 'string' ? inner.episode_label : undefined,
        watch_url: typeof inner.watch_url === 'string' ? inner.watch_url : undefined,
        last_watched_at:
            typeof inner.last_watched_at === 'string' ? inner.last_watched_at : undefined,
        episode: parseEpisode(inner.episode),
        movie: parseMovie(inner.movie),
    };
}

export function parseWatchHistoryList(raw: unknown): WatchHistoryItem[] {
    if (!raw || typeof raw !== 'object') return [];
    const o = raw as Record<string, unknown>;
    let list: unknown[] = [];
    if (Array.isArray(o.data)) list = o.data;
    else if (o.data && typeof o.data === 'object') {
        const inner = o.data as Record<string, unknown>;
        if (Array.isArray(inner.data)) list = inner.data;
    }
    return list
        .map(parseWatchHistoryItem)
        .filter((x): x is WatchHistoryItem => Boolean(x));
}

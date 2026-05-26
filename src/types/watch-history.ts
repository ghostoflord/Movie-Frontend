export type WatchHistoryEpisode = {
    id: number;
    name?: string;
    slug?: string;
    episode_number?: number;
    movie_id?: number;
};

export type WatchHistoryMovie = {
    id: number;
    name: string;
    slug?: string;
    thumb_url?: string | null;
    poster_url?: string | null;
    episode_current?: string | null;
    episode_total?: string | null;
};

export type WatchHistoryItem = {
    id: number;
    current_time: number;
    /** Giây seek — từ GET /watch-history/continue */
    resume_at?: number;
    duration_watched?: number;
    progress_percent?: number;
    /** VD: "Tập 10" */
    episode_label?: string;
    /** URL do BE sinh (FRONTEND_WATCH_PATH); FE ưu tiên build /phim/{id}?t= */
    watch_url?: string;
    last_watched_at?: string;
    episode?: WatchHistoryEpisode | null;
    movie?: WatchHistoryMovie | null;
};

export type WatchHistorySavePayload = {
    episode_id: number;
    current_time: number;
    duration_watched?: number;
};

export type WatchHistoryListMeta = {
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
};

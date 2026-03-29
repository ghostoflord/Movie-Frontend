/**
 * Types khớp API `GET .../movies` (danh sách trong `data[]` + `meta`).
 */

export type MoviesListMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

export type PublicEpisode = {
    id: number;
    name: string;
    slug: string;
    episode_number: number;
    video_url: string | null;
};

/** Một phần tử trong `data` — nhiều field có thể null */
export type PublicMovieListItem = {
    id: number;
    name: string;
    origin_name: string;
    slug: string;
    thumb_url: string;
    poster_url: string;
    quality: string;
    episode_current: string;
    episode_total: string;
    year: number;
    status: string;
    description?: string | null;
    language?: string | null;
    categories?: string[] | null;
    actors?: string[] | null;
    directors?: string[] | null;
    episodes?: PublicEpisode[] | null;
    created_at?: string;
    updated_at?: string;
    country?: string | null;
    view_count?: number | null;
};

export type MoviesListResponse = {
    data: PublicMovieListItem[];
    meta?: MoviesListMeta;
};

/** Parse JSON từ GET /movies (Laravel: { data: [], meta }) */
export function parseMoviesListResponse(data: unknown): { list: PublicMovieListItem[]; meta?: MoviesListMeta } {
    if (Array.isArray(data)) {
        return { list: data as PublicMovieListItem[] };
    }
    if (data && typeof data === 'object') {
        const o = data as Record<string, unknown>;

        if (o.data != null && typeof o.data === 'object' && !Array.isArray(o.data)) {
            const inner = o.data as Record<string, unknown>;
            if (Array.isArray(inner.data)) {
                return {
                    list: inner.data as PublicMovieListItem[],
                    meta: (inner.meta ?? o.meta) as MoviesListMeta | undefined,
                };
            }
        }

        if (Array.isArray(o.data)) {
            return {
                list: o.data as PublicMovieListItem[],
                meta: o.meta as MoviesListMeta | undefined,
            };
        }
        if (Array.isArray(o.movies)) {
            return { list: o.movies as PublicMovieListItem[], meta: o.meta as MoviesListMeta | undefined };
        }
        if ('id' in o && o.id != null) {
            return { list: [data as PublicMovieListItem] };
        }
    }
    return { list: [] };
}

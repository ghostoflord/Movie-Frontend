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
};

export type MoviesListResponse = {
    data: PublicMovieListItem[];
    meta?: MoviesListMeta;
};

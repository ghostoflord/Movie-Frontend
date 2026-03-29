/** Chi tiết phim từ GET /api/movies/{id} (public) */
export type PublicMovieEpisode = {
    id: number;
    movie_id: number;
    name: string;
    slug: string;
    embed_url: string;
    episode_number: number;
    created_at: string;
    updated_at: string;
};

export type PublicMovieDetail = {
    id: number;
    name: string;
    origin_name: string;
    slug: string;
    thumb_url: string;
    poster_url: string;
    description: string;
    year: number | string;
    quality: string;
    language: string | null;
    categories: string[] | null;
    actors: string[] | null;
    directors: string[] | null;
    /** Quốc gia — có thể null tùy API */
    country?: string | null;
    /** Lượt xem — có thể không có trong API */
    view_count?: number | null;
    /** VD: "2 phút/tập" */
    duration?: string | null;
    status: string;
    episode_current: string;
    episode_total: string;
    created_at: string;
    updated_at: string;
    episodes: PublicMovieEpisode[];
    comments?: unknown[];
};

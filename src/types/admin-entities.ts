export type Category = {
    id: number;
    name: string;
    slug?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type Actor = {
    id: number;
    name: string;
    slug?: string | null;
    thumb_url?: string | null;
    bio?: string | null;
    avatar?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type Server = {
    id: number;
    name: string;
    slug?: string | null;
    base_url?: string | null;
    is_active?: boolean | number | null;
    created_at?: string;
    updated_at?: string;
};

export type Rating = {
    id: number;
    movie_id: number;
    user_id?: number;
    rating: number; // 1..10
    created_at?: string;
    updated_at?: string;
};

export type WatchHistoryCreatePayload = {
    episode_id: number;
    duration_watched?: number | null;
};

export type RecommendationMovie = {
    id: number;
    name: string;
    origin_name?: string;
    slug?: string;
    thumb_url?: string;
    poster_url?: string;
    year?: number | string;
    quality?: string;
    episode_current?: string;
    episode_total?: string;
};

export type AdminUserItem = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: string;
    gender: string | null;
    provider: string;
    active: boolean;
    avatar?: string | null;
    created_at: string;
    updated_at: string;
};


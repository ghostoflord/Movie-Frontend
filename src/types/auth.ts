// types/auth.ts

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    // password_confirmation: string;
    // gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    gender: string | null;
    provider: string;
    active: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    status: number;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    errors?: {
        [key: string]: string[];
    };
}

export interface AuthState {
    setToken: [];
}

export interface Movie {
    data: string;
    id: number;
    name: string;
    origin_name: string;
    slug: string;
    thumb_url: string;
    poster_url: string;
    description: string;
    year: string;
    quality: string;
    language: string | null;
    categories: any | null;
    actors: any | null;
    directors: any | null;
    status: string;
    episode_current: string;
    episode_total: string;
    created_at: string;
    updated_at: string;
    episodes: Episode[];
    comments: any[];
}

export interface Episode {
    id: number;
    movie_id: number;
    name: string;
    slug: string;
    embed_url: string;
    episode_number: number;
    created_at: string;
    updated_at: string;
}

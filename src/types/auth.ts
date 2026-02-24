// types/auth.ts

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
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
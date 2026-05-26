// lib/api.ts - SỬA LẠI
import axios, { AxiosError } from 'axios';
import { LoginCredentials, User, RegisterData, Movie } from '@/types/auth';
import type { AdminEpisode, EpisodesListResponse } from '@/types/episode';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { Actor, Category, Rating, Server, WatchHistoryCreatePayload, RecommendationMovie, AdminUserItem } from '@/types/admin-entities';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
    private api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    constructor() {
        //REQUEST INTERCEPTOR - Lấy token từ store
        this.api.interceptors.request.use(
            (config) => {
                if (config.data instanceof FormData) {
                    config.headers.delete('Content-Type');
                }
                // Lấy token từ store thay vì localStorage
                const token = useAuthStore.getState().token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // RESPONSE INTERCEPTOR - Xử lý 401
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token hết hạn - logout qua store
                    if (typeof window !== 'undefined') {
                        useAuthStore.getState().logout();

                        if (!window.location.pathname.includes('/login')) {
                            window.location.href = '/login';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        const response = await this.api.post<{ user: User; token: string }>(
            '/login',
            credentials
        );
        return response.data;
    }

    // LOGOUT
    async logout(): Promise<{ message: string }> {
        const response = await this.api.post<{ message: string }>('/logout');
        return response.data;
    }

    // REGISTER
    async register(userData: RegisterData): Promise<{ user: User; token: string }> {
        const response = await this.api.post<{ user: User; token: string }>('/register', userData);
        return response.data;
    }

    // GET USER
    async getUser(): Promise<{ data: User }> {
        const response = await this.api.get<{ data: User }>('/user');
        return response.data;
    }

    // Generic methods
    async get<T = any>(url: string, params?: any): Promise<T> {
        const response = await this.api.get<T>(url, { params });
        return response.data;
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.api.post<T>(url, data);
        return response.data;
    }

    async postForm<T = any>(url: string, data: FormData): Promise<T> {
        const response = await this.api.post<T>(url, data);
        return response.data;
    }

    async put<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.api.put<T>(url, data);
        return response.data;
    }

    async putForm<T = any>(url: string, data: FormData): Promise<T> {
        const response = await this.api.put<T>(url, data);
        return response.data;
    }

    async delete<T = any>(url: string): Promise<T> {
        const response = await this.api.delete<T>(url);
        return response.data;
    }
}

export const apiService = new ApiService();

export const authAPI = {
    login: (credentials: LoginCredentials) => apiService.login(credentials),
    googleLogin: (idToken: string) =>
        apiService.post<{ user: User; token: string }>('/login/google', { id_token: idToken }),
    logout: () => apiService.logout(),
    register: (userData: RegisterData) => apiService.register(userData),
    getUser: () => apiService.getUser(),
};

export const movieAPI = {
    // Lấy danh sách phim
    getMovies: (params?: any) =>
        apiService.get<{ data: Movie[] }>('/movies', params),

    // Lấy chi tiết phim
    getMovie: (id: string) =>
        apiService.get<Movie>(`/movies/${id}`),

    // Tạo phim mới
    createMovie: (data: Partial<Movie>) =>
        apiService.post<Movie>('/movies', data),

    // Cập nhật phim
    updateMovie: (id: string, data: Partial<Movie>) =>
        apiService.put<Movie>(`/movies/${id}`, data),

    // Xóa phim
    deleteMovie: (id: string) =>
        apiService.delete(`/movies/${id}`),

    // Paged list (admin)
    listPaged: (params?: { page?: number; per_page?: number; name?: string }) =>
        apiService.get<unknown>('/movies', params),

    // Gán / bỏ gán diễn viên
    assignActors: (movieId: string | number, actorIds: number[]) =>
        apiService.post(`/movies/${movieId}/actors`, { actor_ids: actorIds }),
    unassignActor: (movieId: string | number, actorId: string | number) =>
        apiService.delete(`/movies/${movieId}/actors/${actorId}`),
};

export const episodeAPI = {
    getEpisodes: (params?: { page?: number; per_page?: number }) =>
        apiService.get<EpisodesListResponse>('/episodes', params),

    getEpisode: (id: string) => apiService.get<AdminEpisode | { data: AdminEpisode }>(`/episodes/${id}`),

    createEpisode: (data: Partial<AdminEpisode> & { movie_id: number }) =>
        apiService.post<AdminEpisode | { data: AdminEpisode }>('/episodes', data),

    updateEpisode: (id: string, data: Partial<AdminEpisode>) =>
        apiService.put<AdminEpisode | { data: AdminEpisode }>(`/episodes/${id}`, data),

    deleteEpisode: (id: string) => apiService.delete(`/episodes/${id}`),
};

function unwrapList<T>(raw: unknown): T[] {
    if (Array.isArray(raw)) return raw as T[];
    if (raw && typeof raw === 'object') {
        const o = raw as Record<string, unknown>;
        if (Array.isArray(o.data)) return o.data as T[];
        if (o.data && typeof o.data === 'object') {
            const inner = o.data as Record<string, unknown>;
            if (Array.isArray(inner.data)) return inner.data as T[];
        }
    }
    return [];
}

function unwrapOne<T>(raw: unknown): T | null {
    if (raw && typeof raw === 'object' && 'data' in (raw as any)) {
        return ((raw as any).data ?? null) as T | null;
    }
    return (raw as T) ?? null;
}

export const categoryAPI = {
    list: () => apiService.get<unknown>('/categories').then(unwrapList<Category>),
    listPaged: (params?: { page?: number; per_page?: number; name?: string }) => apiService.get<unknown>('/categories', params),
    get: (id: string | number) => apiService.get<unknown>(`/categories/${id}`).then((r) => unwrapOne<Category>(r)),
    create: (data: Partial<Category>) => apiService.post<unknown>('/categories', data).then((r) => unwrapOne<Category>(r)),
    update: (id: string | number, data: Partial<Category>) =>
        apiService.put<unknown>(`/categories/${id}`, data).then((r) => unwrapOne<Category>(r)),
    delete: (id: string | number) => apiService.delete(`/categories/${id}`),
};

export const actorAPI = {
    list: (params?: { page?: number; per_page?: number; name?: string }) => apiService.get<unknown>('/actors', params),
    get: (id: string | number) => apiService.get<unknown>(`/actors/${id}`).then((r) => unwrapOne<Actor>(r)),
    create: (
        data: Partial<Pick<Actor, 'name' | 'slug' | 'bio' | 'thumb_url' | 'avatar'>>,
        avatarFile?: File | null,
    ) => {
        if (avatarFile) {
            const fd = new FormData();
            if (data.name != null) fd.append('name', String(data.name));
            if (data.slug != null) fd.append('slug', String(data.slug));
            if (data.bio != null) fd.append('bio', String(data.bio));
            fd.append('avatar', avatarFile);
            return apiService.postForm<unknown>('/actors', fd).then((r) => unwrapOne<Actor>(r));
        }
        return apiService.post<unknown>('/actors', data).then((r) => unwrapOne<Actor>(r));
    },
    update: (
        id: string | number,
        data: Partial<Pick<Actor, 'name' | 'slug' | 'bio' | 'thumb_url' | 'avatar'>>,
        avatarFile?: File | null,
    ) => {
        if (avatarFile) {
            const fd = new FormData();
            if (data.name != null) fd.append('name', String(data.name));
            if (data.slug != null) fd.append('slug', String(data.slug));
            if (data.bio != null) fd.append('bio', String(data.bio));
            fd.append('avatar', avatarFile);
            return apiService.putForm<unknown>(`/actors/${id}`, fd).then((r) => unwrapOne<Actor>(r));
        }
        return apiService.put<unknown>(`/actors/${id}`, data).then((r) => unwrapOne<Actor>(r));
    },
    delete: (id: string | number) => apiService.delete(`/actors/${id}`),
};

export const serverAPI = {
    list: () => apiService.get<unknown>('/servers').then(unwrapList<Server>),
    listPaged: (params?: { page?: number; per_page?: number; name?: string }) => apiService.get<unknown>('/servers', params),
    get: (id: string | number) => apiService.get<unknown>(`/servers/${id}`).then((r) => unwrapOne<Server>(r)),
    create: (data: Partial<Server>) => apiService.post<unknown>('/servers', data).then((r) => unwrapOne<Server>(r)),
    update: (id: string | number, data: Partial<Server>) =>
        apiService.put<unknown>(`/servers/${id}`, data).then((r) => unwrapOne<Server>(r)),
    delete: (id: string | number) => apiService.delete(`/servers/${id}`),
};

export const ratingAPI = {
    list: () => apiService.get<unknown>('/ratings').then(unwrapList<Rating>),
    listPaged: (params?: { page?: number; per_page?: number }) => apiService.get<unknown>('/ratings', params),
    get: (id: string | number) => apiService.get<unknown>(`/ratings/${id}`).then((r) => unwrapOne<Rating>(r)),
    create: (data: { movie_id: number; rating: number }) =>
        apiService.post<unknown>('/ratings', data).then((r) => unwrapOne<Rating>(r)),
    update: (id: string | number, data: Partial<Rating>) =>
        apiService.put<unknown>(`/ratings/${id}`, data).then((r) => unwrapOne<Rating>(r)),
    delete: (id: string | number) => apiService.delete(`/ratings/${id}`),
};

export const watchHistoryAPI = {
    saveProgress: (data: WatchHistoryCreatePayload) => apiService.post('/watch-history', data),
};

export const recommendationsAPI = {
    get: () => apiService.get<unknown>('/recommendations').then(unwrapList<RecommendationMovie>),
};

function favoriteRecordToMovie(item: unknown): RecommendationMovie | null {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    const raw = row.movie && typeof row.movie === 'object' ? row.movie : row;
    if (!raw || typeof raw !== 'object') return null;
    const m = raw as Record<string, unknown>;
    const id = Number(m.id ?? row.movie_id);
    if (!id || Number.isNaN(id)) return null;
    const name = String(m.name ?? m.title ?? '');
    if (!name) return null;
    return {
        id,
        name,
        origin_name: m.origin_name != null ? String(m.origin_name) : undefined,
        slug: m.slug != null ? String(m.slug) : undefined,
        thumb_url: m.thumb_url != null ? String(m.thumb_url) : undefined,
        poster_url: m.poster_url != null ? String(m.poster_url) : undefined,
        year: (m.year as RecommendationMovie['year']) ?? undefined,
        quality: m.quality != null ? String(m.quality) : undefined,
        episode_current: m.episode_current != null ? String(m.episode_current) : undefined,
        episode_total: m.episode_total != null ? String(m.episode_total) : undefined,
    };
}

/** Danh sách phim yêu thích của user đang đăng nhập (Bearer token). */
export const favoritesAPI = {
    list: () =>
        apiService.get<unknown>('/favorites').then((raw) => {
            const items = unwrapList<unknown>(raw);
            const seen = new Set<number>();
            const movies: RecommendationMovie[] = [];
            for (const item of items) {
                const movie = favoriteRecordToMovie(item);
                if (movie && !seen.has(movie.id)) {
                    seen.add(movie.id);
                    movies.push(movie);
                }
            }
            return movies;
        }),
    /** POST /favorites/{movieId} — bật/tắt yêu thích. */
    toggle: (movieId: string | number) =>
        apiService.post<{ message?: string }>(`/favorites/${movieId}`).then((res) => {
            const msg = (res?.message ?? '').toLowerCase();
            if (msg.includes('removed')) {
                return { isFavorite: false, message: res?.message };
            }
            if (msg.includes('added')) {
                return { isFavorite: true, message: res?.message };
            }
            return { isFavorite: false, message: res?.message };
        }),
    listIds: () => favoritesAPI.list().then((movies) => movies.map((m) => m.id)),
};

function appendAdminUserFormFields(
    fd: FormData,
    fields: {
        name: string;
        email: string;
        password?: string;
        role?: string;
        active?: boolean;
        gender?: string | null;
    },
) {
    fd.append('name', fields.name);
    fd.append('email', fields.email);
    if (fields.password != null && fields.password !== '') {
        fd.append('password', fields.password);
    }
    fd.append('role', fields.role ?? 'USER');
    fd.append('active', fields.active !== false ? '1' : '0');
    const g = fields.gender;
    if (g) fd.append('gender', g);
}

export const adminUserAPI = {
    list: (params?: { page?: number; per_page?: number }) =>
        apiService.get<unknown>('/users', params),
    get: (id: string | number) => apiService.get<unknown>(`/users/${id}`).then((r) => unwrapOne<AdminUserItem>(r)),
    create: (
        data: { name: string; email: string; password: string; role?: string; active?: boolean; gender?: string | null },
        avatarFile?: File | null,
    ) => {
        if (avatarFile) {
            const fd = new FormData();
            appendAdminUserFormFields(fd, data);
            fd.append('avatar', avatarFile);
            return apiService.postForm<unknown>('/users', fd).then((r) => unwrapOne<AdminUserItem>(r));
        }
        return apiService.post<unknown>('/users', data).then((r) => unwrapOne<AdminUserItem>(r));
    },
    update: (
        id: string | number,
        data: Partial<{ name: string; email: string; password?: string; role?: string; active?: boolean; gender?: string | null }>,
        avatarFile?: File | null,
    ) => {
        if (avatarFile) {
            const fd = new FormData();
            appendAdminUserFormFields(fd, {
                name: data.name ?? '',
                email: data.email ?? '',
                password: data.password,
                role: data.role,
                active: data.active,
                gender: data.gender ?? null,
            });
            fd.append('avatar', avatarFile);
            return apiService.putForm<unknown>(`/users/${id}`, fd).then((r) => unwrapOne<AdminUserItem>(r));
        }
        return apiService.put<unknown>(`/users/${id}`, data).then((r) => unwrapOne<AdminUserItem>(r));
    },
    delete: (id: string | number) => apiService.delete(`/users/${id}`),
};

export type CrawlStatus = {
    status: 'idle' | 'processing' | 'done' | 'failed' | string;
    started_at?: string;
    pages?: number;
    category?: string;
    message?: string;
};

export const crawlAPI = {
    status: () => apiService.get<CrawlStatus>('/admin/crawl-status'),
    crawlCategory: (data: { category: string; pages?: number }) => apiService.post('/admin/crawl/category', data),
    crawlMovies: (data: { pages?: number }) => apiService.post('/admin/crawl-movies', data),
};

export type VnpayPlanId = 'monthly' | 'yearly';

export type VnpayPlanInfo = {
    amount: number;
    days: number;
    label: string;
};

export type VnpayCreatePaymentResult = {
    payment_url: string;
    order_id: string;
};

export const vnpayAPI = {
    getPlans: () =>
        apiService.get<{ data: Record<VnpayPlanId, VnpayPlanInfo> }>('/vnpay/plans'),
    createPayment: (plan: VnpayPlanId) =>
        apiService.post<{ data: VnpayCreatePaymentResult }>('/vnpay/create-payment', { plan }),
};

export default apiService;
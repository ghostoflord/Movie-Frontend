import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { LoginCredentials, LoginResponse, ApiResponse, User, RegisterData, ApiError } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: true,
        });

        // Request interceptor
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('access_token');
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError<ApiError>) => {
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
        const response = await this.api.post<{ token: string; user: User }>('/login', credentials);
        return response.data; // Laravel trả về { token, user }
    }

    async logout(): Promise<{ message: string }> {
        const response = await this.api.post<{ message: string }>('/logout');
        return response.data;
    }

    async register(userData: RegisterData): Promise<User> {
        const response = await this.api.post<User>('/register', userData);
        return response.data; // Laravel trả về user trực tiếp
    }

    async getUser(): Promise<{ data: User }> {
        const response = await this.api.get<{ data: User }>('/user');
        return response.data;
    }

    // Generic CRUD methods
    async get<T = any>(url: string, params?: any): Promise<T> {
        const response = await this.api.get<T>(url, { params });
        return response.data;
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.api.post<T>(url, data);
        return response.data;
    }

    async put<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.api.put<T>(url, data);
        return response.data;
    }

    async delete<T = any>(url: string): Promise<T> {
        const response = await this.api.delete<T>(url);
        return response.data;
    }
}

// Tạo instance và export
export const apiService = new ApiService();

// Export các hàm tiện ích cho React Query
export const authAPI = {
    login: (credentials: LoginCredentials) => apiService.login(credentials),
    logout: () => apiService.logout(),
    register: (userData: RegisterData) => apiService.register(userData),
    getUser: () => apiService.getUser(),
};

export default apiService;
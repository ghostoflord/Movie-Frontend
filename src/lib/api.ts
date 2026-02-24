// lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { LoginCredentials, User, RegisterData } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            withCredentials: true, // QUAN TRỌNG: để gửi và nhận cookie
        });

        // Request interceptor - KHÔNG cần thêm token vào header
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
                }
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
                }
                return response;
            },
            (error: AxiosError) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
                }

                // Xử lý lỗi 401 - Cookie đã hết hạn
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    // Chỉ redirect, không cần xóa localStorage vì không dùng
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<{ user: User; message: string }> {
        // Nếu dùng Sanctum, cần lấy CSRF cookie trước (chỉ 1 lần)
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
            withCredentials: true
        });

        const response = await this.api.post<{ user: User; message: string }>('/login', credentials);
        return response.data;
    }

    async logout(): Promise<{ message: string }> {
        const response = await this.api.post<{ message: string }>('/logout');
        return response.data;
    }

    async register(userData: RegisterData): Promise<User> {
        const response = await this.api.post<User>('/register', userData);
        return response.data;
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

// Export các hàm tiện ích
export const authAPI = {
    login: (credentials: LoginCredentials) => apiService.login(credentials),
    logout: () => apiService.logout(),
    register: (userData: RegisterData) => apiService.register(userData),
    getUser: () => apiService.getUser(),
};

export default apiService;
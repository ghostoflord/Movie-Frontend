// lib/api.ts - SỬA LẠI
import axios, { AxiosError } from 'axios';
import { LoginCredentials, User, RegisterData } from '@/types/auth';
import { useAuthStore } from '@/hooks/useAuthStore';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
    private api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    constructor() {
        // ✅ REQUEST INTERCEPTOR - Lấy token từ store
        this.api.interceptors.request.use(
            (config) => {
                // Lấy token từ store thay vì localStorage
                const token = useAuthStore.getState().token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // ✅ RESPONSE INTERCEPTOR - Xử lý 401
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

    // ✅ LOGIN
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
        const response = await this.api.post<{ user: User; token: string }>(
            '/login',
            credentials
        );
        return response.data;
    }

    // ✅ LOGOUT
    async logout(): Promise<{ message: string }> {
        const response = await this.api.post<{ message: string }>('/logout');
        return response.data;
    }

    // ✅ REGISTER
    async register(userData: RegisterData): Promise<{ user: User; token: string }> {
        const response = await this.api.post<{ user: User; token: string }>('/register', userData);
        return response.data;
    }

    // ✅ GET USER
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

    async put<T = any>(url: string, data?: any): Promise<T> {
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
    logout: () => apiService.logout(),
    register: (userData: RegisterData) => apiService.register(userData),
    getUser: () => apiService.getUser(),
};

export default apiService;
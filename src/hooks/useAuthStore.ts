// hooks/useAuthStore.ts - THÊM MỚI
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { User, RegisterData } from '@/types/auth';

interface AuthState {
    // State
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isLoggingIn: boolean;
    isRegistering: boolean;
    
    // Actions
    login: (credentials: { email: string; password: string }) => Promise<any>;
    register: (userData: RegisterData) => Promise<any>;
    logout: () => Promise<void>;
    checkUser: () => Promise<void>;
}

// Biến để tránh gọi API song song
let fetchPromise: Promise<any> | null = null;

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            token: null,
            isLoading: true,
            isLoggingIn: false,
            isRegistering: false,

            // Check user - CHỈ GỌI 1 LẦN
            checkUser: async () => {
                // Nếu đã có user thì thôi
                if (get().user) {
                    set({ isLoading: false });
                    return;
                }

                // Nếu đang fetch thì đợi
                if (fetchPromise) {
                    await fetchPromise;
                    return;
                }

                fetchPromise = (async () => {
                    try {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            set({ user: null, isLoading: false });
                            return;
                        }

                        const response = await authAPI.getUser();
                        set({ 
                            user: response.data, 
                            token,
                            isLoading: false 
                        });
                    } catch (error) {
                        localStorage.removeItem('token');
                        set({ 
                            user: null, 
                            token: null, 
                            isLoading: false 
                        });
                    } finally {
                        fetchPromise = null;
                    }
                })();

                await fetchPromise;
            },

            // Login
            login: async (credentials) => {
                set({ isLoggingIn: true });
                try {
                    const response = await authAPI.login(credentials);
                    
                    localStorage.setItem('token', response.token);
                    
                    set({ 
                        user: response.user, 
                        token: response.token,
                        isLoggingIn: false 
                    });
                    
                    return response;
                } catch (error) {
                    set({ isLoggingIn: false });
                    throw error;
                }
            },

            // Register
            register: async (userData) => {
                set({ isRegistering: true });
                try {
                    const response = await authAPI.register(userData);
                    
                    localStorage.setItem('token', response.token);
                    
                    set({ 
                        user: response.user, 
                        token: response.token,
                        isRegistering: false 
                    });
                    
                    return response;
                } catch (error) {
                    set({ isRegistering: false });
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                try {
                    await authAPI.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('token');
                    set({ 
                        user: null, 
                        token: null 
                    });
                }
            },
        }),
        {
            name: 'auth-storage', // Lưu vào localStorage
            partialize: (state) => ({ 
                user: state.user,
                token: state.token 
            }),
        }
    )
);

// Auto check user khi khởi động app (CHỈ 1 LẦN)
if (typeof window !== 'undefined') {
    useAuthStore.getState().checkUser();
}
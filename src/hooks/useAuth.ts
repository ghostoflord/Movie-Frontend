import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { User, LoginCredentials } from '@/types/auth';

export const useAuth = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Get user query
    const { data: userData, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const response = await authAPI.getUser();
                return response.data;
            } catch (error) {
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: authAPI.login,
        onSuccess: (data) => {
            // Lưu token và user
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            queryClient.setQueryData(['user'], data.user);
            router.push('/dashboard');
        },
        onError: (error: any) => {
            console.error('Login error:', error);
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            queryClient.setQueryData(['user'], null);
            router.push('/login');
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: authAPI.register,
        onSuccess: (user) => {
            // Sau khi register, có thể tự động login hoặc redirect to login
            router.push('/login?registered=true');
        },
    });

    return {
        user: userData || null,
        isLoading,
        isAuthenticated: !!userData,
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isRegistering: registerMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { User } from '@/types/auth';

export const useAuth = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Kiểm tra user từ cookie khi component mount
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const response = await authAPI.getUser();
            setUser(response.data);
        } catch (error) {
            // User chưa login - không sao
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: { email: string; password: string }) => {
        setIsLoggingIn(true);
        try {
            const response = await authAPI.login(credentials);
            setUser(response.user);
            router.push('/dashboard');
            return response;
        } catch (error: any) {
            throw error;
        } finally {
            setIsLoggingIn(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
        } finally {
            setUser(null);
            router.push('/login');
        }
    };

    return {
        user,
        isLoading,
        isLoggingIn,
        login,
        logout,
        isAuthenticated: !!user,
    };
};
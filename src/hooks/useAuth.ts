import { useAuthStore } from '@/hooks/useAuthStore';

export const useAuth = () => {
    const { 
        user, 
        token,
        isLoading, 
        isLoggingIn, 
        isRegistering,
        login, 
        register, 
        logout,
    } = useAuthStore();

    return {
        user,
        token,
        isLoading,
        isLoggingIn,
        isRegistering,
        
        // Actions
        login,
        register,
        logout,
        
        // Computed
        isAuthenticated: !!user && !!token,
    };
};
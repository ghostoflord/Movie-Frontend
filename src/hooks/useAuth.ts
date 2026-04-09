import { useAuthStore } from '@/hooks/useAuthStore';

export const useAuth = () => {
    const { 
        user, 
        token,
        isLoading, 
        isLoggingIn, 
        isRegistering,
        login, 
        googleLogin,
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
        googleLogin,
        register,
        logout,
        
        // Computed
        isAuthenticated: !!user && !!token,
    };
};
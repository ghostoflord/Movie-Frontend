'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Container cho Sidebar và Content - dùng flex để nó nằm ngang */}
            <div className="flex mt-16 h-[calc(100vh-64px)]">
                {/* Sidebar - 40% */}
                <div className="w-2/5 h-full">
                    <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                </div>

                {/* Content - 60% */}
                <main className="w-1/5 h-full overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
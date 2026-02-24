'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Profile', href: '/dashboard/profile' },
        { name: 'Settings', href: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Dashboard Header */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                                    Dashboard
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${pathname === item.href
                                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                {user?.name}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dashboard Content */}
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/client/header';

/**
 * Không dùng header trang chủ: /admin, đăng nhập / đăng ký / quên mật khẩu.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const hideSiteHeader =
        pathname?.startsWith('/admin') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password';

    if (hideSiteHeader) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen pt-16">{children}</main>
        </>
    );
}

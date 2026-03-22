'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/client/header';

/**
 * Trang /admin dùng layout riêng (AdminHeader + sidebar), không dùng header trang chủ.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen pt-16">{children}</main>
        </>
    );
}

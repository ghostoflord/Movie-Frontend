'use client';

import Link from 'next/link';

/**
 * Khung chung cho đăng nhập / đăng ký / quên mật khẩu — không dùng header trang chủ.
 */
export function AuthScaffold({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] text-zinc-100">
            {/* Nền + vệt sáng nhẹ */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(229,9,20,0.18),transparent_55%)]"
                aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-900/40 to-black" aria-hidden />

            <header className="relative z-20 flex items-center justify-between px-4 py-5 sm:px-8">
                <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e50914] text-sm font-black text-white shadow-lg shadow-red-900/40">
                        O
                    </span>
                    <span className="text-xl font-black tracking-wide text-white sm:text-2xl">OPHIM</span>
                </Link>
                <Link
                    href="/"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                >
                    Về trang chủ
                </Link>
            </header>

            <div className="relative z-10 flex min-h-[calc(100vh-8.5rem)] flex-col items-center justify-center px-4 pb-10 pt-2 sm:px-6">
                {children}
            </div>

            <footer className="relative z-10 border-t border-white/[0.06] px-4 py-5 text-center text-xs text-zinc-600 sm:px-8">
                <p>
                    Câu hỏi?{' '}
                    <Link href="#" className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline">
                        Trung tâm trợ giúp
                    </Link>
                    {' · '}
                    <Link href="#" className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline">
                        Điều khoản
                    </Link>
                    {' · '}
                    <Link href="#" className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline">
                        Quyền riêng tư
                    </Link>
                </p>
            </footer>
        </div>
    );
}

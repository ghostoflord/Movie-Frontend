'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { EyeClose } from '@/components/icons/EyeClose';
import FilmIcon from '@/components/icons/FilmIcon';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoggingIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await login(formData);
            if (response) {
                const userRole = response.user?.role;
                if (userRole === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        } catch (err: unknown) {
            const anyErr = err as { response?: { data?: { message?: string } } };
            setError(anyErr.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
        }
    };

    return (
        <div className="w-full max-w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl md:p-10">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e50914] to-rose-700 shadow-lg shadow-red-900/30">
                        <FilmIcon className="h-8 w-8 text-white" />
                    </div>
                </div>

                <h1 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">Chào mừng trở lại</h1>
                <p className="mb-8 text-center text-sm text-zinc-400">Đăng nhập để tiếp tục xem phim</p>

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-sm text-red-100">
                        <span className="mt-0.5 shrink-0 text-red-400">!</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="group relative">
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder=" "
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="peer w-full rounded-xl border-2 border-transparent bg-zinc-800/90 px-5 pb-3 pt-6 text-white outline-none transition placeholder:text-transparent focus:border-[#e50914]/80"
                        />
                        <label
                            htmlFor="email"
                            className="pointer-events-none absolute left-5 top-1 text-xs text-zinc-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#e50914]"
                        >
                            Email
                        </label>
                    </div>

                    <div className="group relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder=" "
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="peer w-full rounded-xl border-2 border-transparent bg-zinc-800/90 px-5 pb-3 pt-6 pr-12 text-white outline-none transition placeholder:text-transparent focus:border-[#e50914]/80"
                        />
                        <label
                            htmlFor="password"
                            className="pointer-events-none absolute left-5 top-1 text-xs text-zinc-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#e50914]"
                        >
                            Mật khẩu
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            {showPassword ? <EyeClose className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#e50914] to-rose-700 py-3.5 font-bold text-white shadow-lg shadow-red-900/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoggingIn ? (
                            <>
                                <svg
                                    className="-ml-1 mr-2 h-5 w-5 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
                        <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-[#e50914] focus:ring-[#e50914]"
                        />
                        Ghi nhớ tôi
                    </label>
                    <Link href="/forgot-password" className="text-zinc-400 transition hover:text-white">
                        Quên mật khẩu?
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-zinc-500">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="font-semibold text-white/90 underline-offset-2 hover:text-[#e50914] hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                <p className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600">
                    Trang này có thể được bảo vệ bởi reCAPTCHA. Tiếp tục nghĩa là bạn đồng ý với điều khoản dịch vụ.
                </p>
            </div>
        </div>
    );
}

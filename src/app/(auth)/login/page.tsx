'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { EyeClose } from '@/components/icons/EyeClose';


export default function LoginPage() {
    const router = useRouter();
    const { login, isLoggingIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State cho mắt

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
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
            {/* Background Image với Overlay đẹp hơn */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-07e3f8eb1418/1321453d-19c7-44aa-9943-42e12f6a70e7/VN-vi-20220214-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
                    filter: 'brightness(0.4) blur(2px)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
            </div>

            {/* Login Card - Đẹp hơn với hiệu ứng */}
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                {/* Logo hoặc Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <EyeIcon />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-2">Chào mừng trở lại</h1>
                <p className="text-gray-400 text-center mb-8">Đăng nhập để tiếp tục xem phim</p>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-white text-sm rounded-lg flex items-center">
                        <EyeClose />
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="relative group">
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder=" "
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent"
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500"
                        >
                            Email
                        </label>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500">

                        </div>
                    </div>

                    <div className="relative group">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder=" "
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent pr-12"
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500"
                        >
                            Mật khẩu
                        </label>

                        {/* Nút con mắt */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeClose className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600  text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                    >
                        {isLoggingIn ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang đăng nhập...
                            </>
                        ) : 'Đăng nhập'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="remember"
                            className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                            Ghi nhớ tôi
                        </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Quên mật khẩu?
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-white hover:text-red-500 font-semibold transition-colors">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 leading-tight">
                        Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải là bot.
                    </p>
                </div>
            </div>
        </div>
    );
}
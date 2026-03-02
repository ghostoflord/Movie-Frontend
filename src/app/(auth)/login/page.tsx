'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoggingIn } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
                  const response = await login(formData);
                    if (response) {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-black">
            {/* Background Image với Overlay tối */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
                style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-07e3f8eb1418/1321453d-19c7-44aa-9943-42e12f6a70e7/VN-vi-20220214-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 md:p-14 bg-black/75 rounded-md border border-white/10 backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-white mb-8">Đăng nhập</h1>
                
                {error && (
                    <div className="mb-4 p-3 bg-[#e87c03] text-white text-sm rounded">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#333] text-white rounded px-5 py-3.5 outline-none focus:bg-[#454545] transition-all placeholder-gray-400"
                        />
                    </div>

                    <div className="relative">
                        <input
                            id="password"
                            type="password"
                            required
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-[#333] text-white rounded px-5 py-3.5 outline-none focus:bg-[#454545] transition-all placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-3.5 mt-4 bg-[#e50914] hover:bg-[#c10712] text-white font-bold rounded transition-colors disabled:bg-[#e50914]/50"
                    >
                        {isLoggingIn ? 'Đang kiểm tra...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="mt-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-gray-400 text-sm">
                        <div className="flex items-center">
                            <input type="checkbox" id="remember" className="mr-2 w-4 h-4 accent-red-600" />
                            <label htmlFor="remember">Ghi nhớ tôi</label>
                        </div>
                        <Link href="#" className="hover:underline text-xs">Bạn cần trợ giúp?</Link>
                    </div>

                    <div className="text-gray-500 mt-4">
                        Mới tham gia? {' '}
                        <Link href="/register" className="text-white hover:underline">
                            Đăng ký ngay.
                        </Link>
                    </div>
                    
                    <p className="text-xs text-gray-500 leading-tight">
                        Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo bạn không phải là bot.
                    </p>
                </div>
            </div>
        </div>
    );
}
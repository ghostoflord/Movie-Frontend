'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import UserIcon from '@/components/icons/UserIcon';
import MailIcon from '@/components/icons/MailIcon';
import LockIcon from '@/components/icons/LockIcon';
import { EyeClose } from '@/components/icons/EyeClose';
import { EyeIcon } from '@/components/icons/EyeIcon';


export default function RegisterPage() {
    const router = useRouter();
    const { register, isRegistering } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!formData.name.trim()) {
            setError('Vui lòng nhập tên');
            return;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await register(formData);
            router.push('/');
        } catch (err: any) {
            console.error('Register error:', err);
            const message = err.response?.data?.message;
            if (message?.includes('email has already been taken')) {
                setError('Email này đã được đăng ký');
            } else {
                setError(message || 'Đăng ký thất bại');
            }
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
            {/* Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                    backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-07e3f8eb1418/1321453d-19c7-44aa-9943-42e12f6a70e7/VN-vi-20220214-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
                    filter: 'brightness(0.4) blur(2px)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
            </div>

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserIcon className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white text-center mb-2">Tạo tài khoản mới</h1>
                <p className="text-gray-400 text-center mb-8">Đăng ký để trải nghiệm xem phim</p>
                
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-white text-sm rounded-lg flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 text-white text-sm rounded-lg flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Họ tên */}
                    <div className="relative group">
                        <input
                            id="name"
                            type="text"
                            required
                            placeholder=" "
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent"
                            disabled={isRegistering || successMessage !== ''}
                        />
                        <label 
                            htmlFor="name" 
                            className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500"
                        >
                            Họ và tên
                        </label>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500">
                            <UserIcon className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <input
                            id="email"
                            type="email"
                            required
                            placeholder=" "
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent"
                            disabled={isRegistering || successMessage !== ''}
                        />
                        <label 
                            htmlFor="email" 
                            className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500"
                        >
                            Email
                        </label>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500">
                            <MailIcon className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Mật khẩu */}
                    <div className="relative group">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder=" "
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent pr-12"
                            disabled={isRegistering || successMessage !== ''}
                        />
                        <label 
                            htmlFor="password" 
                            className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500"
                        >
                            Mật khẩu
                        </label>
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

                    <p className="text-xs text-gray-500 mt-1">
                        Mật khẩu phải có ít nhất 6 ký tự
                    </p>

                    <button
                        type="submit"
                        disabled={isRegistering || successMessage !== ''}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                    >
                        {isRegistering ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : 'Đăng ký'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-white hover:text-red-500 font-semibold transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 leading-tight">
                        Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
}
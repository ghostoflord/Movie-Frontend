// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Key, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0: email, 1: otp+password, 2: success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const steps = [
        { label: 'Email', icon: Mail },
        { label: 'Xác thực', icon: Key },
        { label: 'Hoàn thành', icon: CheckCircle },
    ];

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Gọi API gửi OTP
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gửi OTP thất bại');
            }

            // Chuyển sang bước 1
            setStep(1);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password: newPassword, password_confirmation: confirmPassword }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đặt lại mật khẩu thất bại');
            }

            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
            {/* Background image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-07e3f8eb1418/1321453d-19c7-44aa-9943-42e12f6a70e7/VN-vi-20220214-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
                    filter: 'brightness(0.4) blur(2px)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
            </div>

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </button>

                {/* Steps indicator */}
                <div className="flex items-center justify-between mb-8">
                    {steps.map((s, index) => {
                        const Icon = s.icon;
                        const isActive = index === step;
                        const isCompleted = index < step;
                        return (
                            <div key={s.label} className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${isActive
                                        ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white'
                                        : isCompleted
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-400'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span
                                    className={`text-xs ${isActive ? 'text-white' : isCompleted ? 'text-green-500' : 'text-gray-500'
                                        }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step 0: Nhập email */}
                {step === 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-white text-center mb-2">Quên mật khẩu</h2>
                        <p className="text-gray-400 text-center mb-6">
                            Nhập email để nhận mã xác thực OTP
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-white text-sm rounded-lg">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div className="relative group">
                                <input
                                    type="email"
                                    required
                                    placeholder=" "
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent"
                                />
                                <label className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500">
                                    Email
                                </label>
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi...
                                    </>
                                ) : (
                                    'Gửi mã OTP'
                                )}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 1: Nhập OTP + mật khẩu mới */}
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-white text-center mb-2">Xác thực OTP</h2>
                        <p className="text-gray-400 text-center mb-6">
                            Mã OTP đã gửi đến <span className="text-white font-semibold">{email}</span>
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-white text-sm rounded-lg">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="relative group">
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder=" "
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent text-center text-2xl tracking-widest"
                                />
                                <label className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500">
                                    Mã OTP 6 số
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder=" "
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent pr-12"
                                />
                                <label className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500">
                                    Mật khẩu mới
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    placeholder=" "
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#2a2a2a] text-white rounded-lg px-5 py-4 pt-6 outline-none border-2 border-transparent focus:border-red-500 transition-all peer placeholder-transparent pr-12"
                                />
                                <label className="absolute left-5 top-1 text-gray-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-sm peer-focus:text-red-500">
                                    Xác nhận mật khẩu
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đặt lại mật khẩu'
                                )}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2: Thành công */}
                {step === 2 && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Thành công!</h2>
                        <p className="text-gray-400 mb-8">Mật khẩu của bạn đã được thay đổi.</p>
                        <Link
                            href="/login"
                            className="inline-block w-full py-4 bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                )}

                {/* Link trở về login */}
                {step < 2 && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Nhớ mật khẩu?{' '}
                            <Link href="/login" className="text-white hover:text-red-500 font-semibold transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
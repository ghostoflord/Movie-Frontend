'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Search, ChevronDown, User, LogOut, Film, Tv, Home } from 'lucide-react';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Phim Bộ', href: '/phim-bo', icon: Film },
        { name: 'Phim Lẻ', href: '/phim-le', icon: Film },
        { name: 'Phim Chiếu Rạp', href: '/phim-chieu-rap', icon: Film },
        { name: 'Hoạt Hình', href: '/hoat-hinh', icon: Tv },
        { name: 'TV Shows', href: '/tv-shows', icon: Tv },
    ];

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0B0B0F] shadow-lg' : 'bg-gradient-to-b from-black/90 to-transparent'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                            OPHIM
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Tìm kiếm phim..."
                                className="w-full bg-[#1E1E24] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 border border-gray-800 focus:border-orange-500 focus:outline-none transition"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Navigation - Desktop */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition flex items-center space-x-1"
                            >
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center space-x-3">
                        {/* User menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center space-x-2 bg-[#1E1E24] hover:bg-[#2E2E36] rounded-lg px-3 py-2 transition"
                                >
                                    <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                        <User size={14} className="text-white" />
                                    </div>
                                    <span className="text-sm text-white hidden lg:block">
                                        {user.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {/* Dropdown menu */}
                                {showDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowDropdown(false)}
                                        />
                                        {/* Sửa lại class ở đây */}
                                        <div className="absolute right-0 mt-2 w-56 bg-[#1E1E24] border border-gray-800 rounded-lg shadow-xl z-50 translate-x-[-100%]">
                                            <div className="py-2">
                                                <div className="px-4 py-3 border-b border-gray-800">
                                                    <p className="text-sm font-medium text-white">{user.email}</p>
                                                    <p className="text-xs text-gray-400 mt-1 capitalize">{user.role}</p>
                                                </div>

                                                <Link
                                                    href="/profile"
                                                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Hồ sơ
                                                </Link>

                                                <Link
                                                    href="/favorites"
                                                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Phim yêu thích
                                                </Link>

                                                <Link
                                                    href="/history"
                                                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Lịch sử xem
                                                </Link>

                                                {user.role === 'ADMIN' && (
                                                    <Link
                                                        href="/admin"
                                                        className="block px-4 py-2.5 text-sm text-orange-400 hover:bg-white/5 hover:text-orange-300 transition"
                                                        onClick={() => setShowDropdown(false)}
                                                    >
                                                        Quản trị
                                                    </Link>
                                                )}

                                                <hr className="border-gray-800 my-1" />

                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-white/5 hover:text-red-400 transition flex items-center space-x-2"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Đăng xuất</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden text-gray-300 hover:text-white p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {showMobileMenu && (
                    <div className="md:hidden bg-[#0B0B0F] border-t border-gray-800 py-4">
                        <nav className="flex flex-col space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition flex items-center space-x-3"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <item.icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
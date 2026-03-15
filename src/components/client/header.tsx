'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Search, User, ChevronDown, LogOut, Film, Tv, Shield, Heart } from 'lucide-react';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Phim Bộ', href: '/phim-bo' },
        { name: 'Phim Lẻ', href: '/phim-le' },
        { name: 'Phim Chiếu Rạp', href: '/phim-chieu-rap' },
        { name: 'Hoạt Hình', href: '/hoat-hinh' },
        { name: 'TV Shows', href: '/tv-shows' },
    ];
    

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left section - Logo & Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-white tracking-wider">
                                OPHIM
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="hidden md:flex items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm phim..."
                                    className="w-64 bg-transparent text-white text-sm py-1.5 border-b border-gray-600 focus:border-white outline-none transition-colors placeholder-gray-400"
                                />
                                <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {/* User menu */}
{user ? (
    <div className="relative">
        <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 group"
        >
            {/* Avatar */}
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-red-900/40">
                    {user.email?.[0]?.toUpperCase() ?? <User size={15} />}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-black" />
            </div>
            <ChevronDown
                size={13}
                className={`text-gray-400 group-hover:text-white transition-all duration-300 ${showDropdown ? 'rotate-180 text-white' : ''}`}
            />
        </button>

        {showDropdown && (
            <>
                <div 
    className="fixed inset-0 z-40" 
    style={{ right: 0, left: 0, width: '100%' }}
    onClick={() => setShowDropdown(false)} 
/>

                <div className="absolute right-0 top-full mt-3 w-56 z-50"
                    style={{
                        background: 'linear-gradient(145deg, #161616, #111)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)',
                    }}
                >
                    {/* User info */}
                    <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {user.email?.[0]?.toUpperCase() ?? <User size={15} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] text-gray-500 leading-none mb-1">Tài khoản</p>
                                <p className="text-[13px] text-white font-medium truncate leading-none">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

                    {/* Menu items */}
                    <div className="p-2">
                        {[
                            { href: '/profile', icon: <User size={14} />, label: 'Hồ sơ của tôi' },
                            { href: '/favorites', icon: <Heart size={14} />, label: 'Phim yêu thích' },
                            ...(user.role === 'ADMIN' ? [{ href: '/admin', icon: <Shield size={14} />, label: 'Quản trị viên' }] : []),
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowDropdown(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150 group/item"
                            >
                                <span className="text-gray-600 group-hover/item:text-red-400 transition-colors">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

                    {/* Logout */}
                    <div className="p-2">
                        <button
                            onClick={() => { logout(); setShowDropdown(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-red-400/80 hover:text-red-300 hover:bg-red-500/8 transition-all duration-150 group/logout"
                        >
                            <LogOut size={14} className="group-hover/logout:translate-x-0.5 transition-transform" />
                            Đăng xuất
                        </button>
                    </div>

                    {/* Bottom padding */}
                    <div className="h-1" />
                </div>
            </>
        )}
    </div>
)  : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition-colors"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
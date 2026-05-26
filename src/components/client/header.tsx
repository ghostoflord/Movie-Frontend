'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { resolveUserAvatarUrl } from '@/lib/avatar';
import { Search, User, ChevronDown, LogOut, Shield, Heart, Clock } from 'lucide-react';
import { canUseContinueWatching, isAdminRole } from '@/lib/roles';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();

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

    const isNavActive = (href: string) => {
        if (!pathname) return false;
        if (pathname === href) return true;
        if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
        return false;
    };

    const avatarUrl = user ? resolveUserAvatarUrl(user.avatar) : null;

    return (
        <header
            className={`fixed top-0 w-full z-50 text-zinc-100 transition-all duration-300 backdrop-blur-md border-b border-white/10 ${isScrolled ? 'bg-black/95' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'}`}
        >
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left section - Logo & Navigation */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-lg bg-[#e50914] flex items-center justify-center shadow-[0_10px_30px_rgba(229,9,20,0.25)]">
                                <span className="font-black text-white text-sm tracking-tight">O</span>
                            </span>
                            <span className="text-xl md:text-2xl font-black text-white tracking-wider">
                                OPHIM
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigation.map((item) => (
                                <span key={item.name} className="inline-flex items-center">
                                    <Link
                                        href={item.href}
                                        className={[
                                            "relative px-3 py-2 text-sm transition-colors text-zinc-300 hover:text-white after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:rounded-full after:bg-[#e50914] after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100",
                                            isNavActive(item.href) ? 'text-white after:scale-x-100' : '',
                                        ].join(' ')}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.name === 'TV Shows' && (
                                        <Link
                                            href="/vip"
                                            className={[
                                                'ml-1 rounded-md px-2 py-0.5 text-xs font-black uppercase tracking-wider transition-all',
                                                'text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.45)]',
                                                'bg-yellow-400/15 ring-1 ring-yellow-400/50 hover:bg-yellow-400/25 hover:text-yellow-200 hover:shadow-[0_0_18px_rgba(250,204,21,0.6)]',
                                                pathname === '/vip' ? 'bg-yellow-400/30 text-yellow-200 ring-yellow-300/70' : '',
                                            ].join(' ')}
                                        >
                                            VIP
                                        </Link>
                                    )}
                                </span>
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
                                    className="w-64 rounded-full border border-zinc-600 bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#e50914] focus:outline-none"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
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
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold text-white shadow-lg shadow-red-900/40">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        user.name?.[0]?.toUpperCase() ??
                        user.email?.[0]?.toUpperCase() ??
                        <User size={15} />
                    )}
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
                            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold text-white">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    user.name?.[0]?.toUpperCase() ??
                                    user.email?.[0]?.toUpperCase() ??
                                    <User size={15} />
                                )}
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
                            ...(canUseContinueWatching(user.role) ? [{ href: '/continue', icon: <Clock size={14} />, label: 'Tiếp tục xem' }] : []),
                            { href: '/favorites', icon: <Heart size={14} />, label: 'Phim yêu thích' },
                            ...(isAdminRole(user.role) ? [{ href: '/admin', icon: <Shield size={14} />, label: 'Quản trị viên' }] : []),
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
                                    className="text-sm text-zinc-300 transition-colors hover:text-white"
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
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIcon from '../icons/HomeIcon';
import FilmIcon from '../icons/FilmIcon';
import VideoCameraIcon from '../icons/VideoCameraIcon';
import UserIcon from '../icons/UserIcon';
import FolderIcon from '../icons/FolderIcon';
import StarIcon from '../icons/StarIcon';
import Cog6ToothIcon from '../icons/Cog6ToothIcon';

const navigation: {
    name: string;
    href: string;
    icon: typeof HomeIcon;
    exact?: boolean;
}[] = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, exact: true },
    { name: 'Quản lý phim', href: '/admin/movies', icon: FilmIcon },
    { name: 'Quản lý tập phim', href: '/admin/episodes', icon: VideoCameraIcon },
    { name: 'Quản lý user', href: '/admin/users', icon: UserIcon },
    { name: 'Thể loại', href: '/admin/categories', icon: FolderIcon },
    { name: 'Đánh giá', href: '/admin/reviews', icon: StarIcon },
    { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const pathname = usePathname();

    const isActiveLink = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <>
            {/* Mobile backdrop */}
            {sidebarOpen ? (
                <button
                    type="button"
                    aria-label="Đóng menu"
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            ) : null}

            <aside
                className={[
                    'fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-zinc-800/90 bg-[#0f1117]',
                    'transition-transform duration-200 ease-out',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:static lg:z-0 lg:translate-x-0',
                ].join(' ')}
            >
                <div className="border-b border-zinc-800/80 px-4 py-4 lg:hidden">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Menu</p>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const active = isActiveLink(item.href, item.exact);
                            const Icon = item.icon;

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={[
                                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                                            active
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-900/20'
                                                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white',
                                        ].join(' ')}
                                    >
                                        <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-zinc-500'}`} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t border-zinc-800/80 p-4">
                    <p className="text-center text-[10px] text-zinc-600">OPHIM Admin</p>
                </div>
            </aside>
        </>
    );
}

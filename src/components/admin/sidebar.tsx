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
import XMarkIcon from '../icons/XMarkIcon';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
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

    return (
        <>
            {/* Mobile sidebar overlay */}
            <div
                className={`fixed inset-0 z-50 bg-gray-900/80 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar - BỎ fixed, BỎ w-72, THÊM w-full */}
            <div
                className={`h-full w-full bg-gradient-to-b from-gray-900 to-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo area */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700">
                    <Link href="/admin" className="flex items-center space-x-2">
                        {/* <FilmIcon className="h-8 w-8 text-red-500" />
                        <span className="text-xl font-bold text-white">MovieAdmin</span> */}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
}
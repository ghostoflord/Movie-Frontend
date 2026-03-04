'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Bars3Icon from '../icons/Bars3Icon';
import BellIcon from '../icons/BellIcon';
import Link from 'next/link';
import FilmIcon from '../icons/FilmIcon';
import XMarkIcon from '../icons/XMarkIcon';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({ sidebarOpen, setSidebarOpen }: HeaderProps) {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700">


            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo area */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700">
                    <Link href="/admin" className="flex items-center space-x-2">
                        <FilmIcon className="h-8 w-8 text-red-500" />
                        <span className="text-xl font-bold text-white">MovieAdmin</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                {/* Mobile menu button */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-400 hover:text-white"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Search bar - thêm nếu cần */}
                <div className="hidden lg:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-80 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-x-4">
                    {/* Notifications */}
                    <button className="relative text-gray-400 hover:text-white">
                        <BellIcon className="h-6 w-6" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 rounded-full text-xs text-white">
                            3
                        </span>
                    </button>

                    {/* User menu */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center gap-x-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-600 to-purple-600 flex items-center justify-center text-white">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}>
                                            Hồ sơ
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button onClick={logout} className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-700' : ''}`}>
                                            Đăng xuất
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
}
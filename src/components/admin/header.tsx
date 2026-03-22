'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Bars3Icon from '../icons/Bars3Icon';
import BellIcon from '../icons/BellIcon';
import FilmIcon from '../icons/FilmIcon';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({ sidebarOpen, setSidebarOpen }: HeaderProps) {
    const { user, logout } = useAuth();
    const initial = user?.email?.[0]?.toUpperCase() ?? user?.name?.[0]?.toUpperCase() ?? 'A';

    return (
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800/90 bg-[#0c0e14]/95 shadow-sm shadow-black/20 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white lg:hidden"
                        aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e50914] shadow-lg shadow-red-900/30">
                            <FilmIcon className="h-5 w-5 text-white" />
                        </span>
                        <span className="hidden flex-col leading-tight sm:flex">
                            <span className="text-sm font-bold tracking-wide text-white">OPHIM</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Bảng điều khiển</span>
                        </span>
                    </Link>
                </div>

                <div className="hidden max-w-md flex-1 px-4 md:block">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Tìm trong admin..."
                            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/"
                        className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white sm:inline"
                    >
                        Về trang chủ
                    </Link>

                    <button
                        type="button"
                        className="relative rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        aria-label="Thông báo"
                    >
                        <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 p-0.5 pr-2 transition hover:border-zinc-600">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-xs font-bold text-white">
                                {initial}
                            </span>
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl ring-1 ring-black/20 focus:outline-none">
                                <div className="border-b border-zinc-800 px-3 py-2">
                                    <p className="truncate text-xs text-zinc-500">Đăng nhập</p>
                                    <p className="truncate text-sm font-medium text-white">{user?.email ?? user?.name ?? 'Admin'}</p>
                                </div>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            href="/"
                                            className={`block px-3 py-2 text-sm ${active ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}
                                        >
                                            Xem website
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            type="button"
                                            onClick={() => logout()}
                                            className={`block w-full px-3 py-2 text-left text-sm ${active ? 'bg-zinc-800 text-red-300' : 'text-red-400/90'}`}
                                        >
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

'use client';

import { useCallback, useEffect, useState } from 'react';
import StatCard from '@/components/admin/statcard';
import UserIcon from '@/components/icons/UserIcon';
import { EyeIcon } from '@/components/icons/EyeIcon';
import FilmIcon from '@/components/icons/FilmIcon';
import StarIcon from '@/components/icons/StarIcon';
import VideoCameraIcon from '@/components/icons/VideoCameraIcon';
import { useAuth } from '@/hooks/useAuth';
import type { AdminDashboardData } from '@/types/admin-dashboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError('Chưa có token đăng nhập.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/admin/dashboard`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const json = await res.json();

            if (!res.ok) {
                setError(typeof json?.message === 'string' ? json.message : `Lỗi ${res.status}`);
                setData(null);
                return;
            }

            const payload = json?.data as AdminDashboardData | undefined;
            if (payload && typeof payload === 'object') {
                setData(payload);
            } else {
                setError('Định dạng dữ liệu dashboard không đúng.');
                setData(null);
            }
        } catch (e) {
            console.error('[AdminDashboard]', e);
            setError('Không gọi được API admin/dashboard.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-6 text-center text-sm text-red-200">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <p className="text-center text-zinc-500">Không có dữ liệu dashboard.</p>
        );
    }

    const d = data;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Dashboard</h1>
                <p className="mt-1 text-sm text-zinc-500">Tổng quan hệ thống — cập nhật theo API</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Tổng phim"
                    value={d.movies.toLocaleString('vi-VN')}
                    icon={<FilmIcon className="h-6 w-6 text-white" />}
                    color="red"
                />
                <StatCard
                    title="Người dùng"
                    value={d.users.toLocaleString('vi-VN')}
                    subtitle={d.users_active ? `${d.users_active} đang hoạt động` : undefined}
                    icon={<UserIcon className="h-6 w-6 text-white" />}
                    color="blue"
                />
                <StatCard
                    title="Lượt xem (lịch sử)"
                    value={d.watch_history.toLocaleString('vi-VN')}
                    icon={<EyeIcon className="h-6 w-6 text-white" />}
                    color="green"
                />
                <StatCard
                    title="Đánh giá"
                    value={d.ratings.toLocaleString('vi-VN')}
                    icon={<StarIcon className="h-6 w-6 text-white" />}
                    color="purple"
                />
            </div>

            <div>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">Chi tiết</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <StatCard
                        title="Tổng tập phim"
                        value={d.episodes.toLocaleString('vi-VN')}
                        icon={<VideoCameraIcon className="h-6 w-6 text-white" />}
                        color="cyan"
                    />
                    <StatCard title="Bình luận" value={d.comments.toLocaleString('vi-VN')} icon={<span className="text-lg">💬</span>} color="amber" />
                    <StatCard title="Yêu thích" value={d.favorites.toLocaleString('vi-VN')} icon={<span className="text-lg">♥</span>} color="red" />
                    <StatCard title="Thông báo" value={d.notifications.toLocaleString('vi-VN')} icon={<span className="text-lg">🔔</span>} color="purple" />
                    <StatCard title="Thể loại" value={d.categories.toLocaleString('vi-VN')} icon={<span className="text-lg">📁</span>} color="green" />
                    <StatCard title="Diễn viên" value={d.actors.toLocaleString('vi-VN')} icon={<span className="text-lg">🎭</span>} color="blue" />
                    <StatCard title="Máy chủ / nguồn" value={d.servers.toLocaleString('vi-VN')} icon={<span className="text-lg">🖥</span>} color="cyan" />
                </div>
            </div>
        </div>
    );
}

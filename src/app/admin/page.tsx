// app/(admin)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/statcard';
import UserIcon from '@/components/icons/UserIcon';
import { EyeIcon } from '@/components/icons/EyeIcon';
import FilmIcon from '@/components/icons/FilmIcon';
import StarIcon from '@/components/icons/StarIcon';


export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalMovies: 0,
        totalUsers: 0,
        totalViews: 0,
        totalRatings: 0,
    });

    useEffect(() => {
        // Fetch stats
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-gray-400 mt-1">Tổng quan hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng phim"
                    value={stats.totalMovies}
                    icon={<FilmIcon className="h-6 w-6 text-white" />}
                    trend={12.5}
                />
                <StatCard
                    title="Người dùng"
                    value={stats.totalUsers}
                    icon={<UserIcon className="h-6 w-6 text-white" />}
                    color="blue"
                    trend={8.2}
                />
                <StatCard
                    title="Lượt xem"
                    value={stats.totalViews.toLocaleString()}
                    icon={<EyeIcon className="h-6 w-6 text-white" />}
                    color="green"
                    trend={23.1}
                />
                <StatCard
                    title="Đánh giá"
                    value={stats.totalRatings}
                    icon={<StarIcon className="h-6 w-6 text-white" />}
                    color="purple"
                    trend={-2.3}
                />
            </div>
        </div>
    );
}
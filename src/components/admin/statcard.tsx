import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: number;
    color?: 'red' | 'blue' | 'green' | 'purple';
}

const colorClasses = {
    red: 'from-red-600 to-red-700',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
};

export default function StatCard({ title, value, icon, trend, color = 'red' }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {trend !== undefined && (
                        <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend >= 0 ? '+' : ''}{trend}% so với tháng trước
                        </p>
                    )}
                </div>
                <div className={`h-12 w-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: number;
    color?: 'red' | 'blue' | 'green' | 'purple' | 'amber' | 'cyan';
    subtitle?: string;
}

const colorClasses = {
    red: 'from-red-500 to-rose-600 shadow-red-500/20',
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    purple: 'from-violet-500 to-purple-600 shadow-violet-500/20',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    cyan: 'from-cyan-500 to-sky-600 shadow-cyan-500/20',
};

export default function StatCard({ title, value, icon, trend, color = 'red', subtitle }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-5 shadow-lg shadow-black/20 transition hover:border-zinc-700/80 hover:shadow-xl">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/[0.07]" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-white">{value}</p>
                    {subtitle ? <p className="mt-1 text-xs text-zinc-500">{subtitle}</p> : null}
                    {trend !== undefined && trend !== 0 ? (
                        <p
                            className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% so với tháng trước
                        </p>
                    ) : null}
                </div>
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
                >
                    <span className="[&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-white">{icon}</span>
                </div>
            </div>
        </div>
    );
}

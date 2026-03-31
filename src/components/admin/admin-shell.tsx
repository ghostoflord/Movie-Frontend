'use client';

import Link from 'next/link';

export function AdminPageHeader({
    title,
    subtitle,
    actionHref,
    actionLabel,
}: {
    title: string;
    subtitle?: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
            </div>
            {actionHref && actionLabel ? (
                <Link
                    href={actionHref}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    {actionLabel}
                </Link>
            ) : null}
        </div>
    );
}


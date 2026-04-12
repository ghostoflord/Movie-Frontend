import type { ReactNode } from 'react';
import Link from 'next/link';

const linkClass =
    'inline-flex items-center gap-2 rounded-xl border border-zinc-600/80 bg-zinc-800/70 px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white';

export function AdminBackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className={linkClass}>
            <span className="text-base leading-none text-zinc-400" aria-hidden>
                ←
            </span>
            {children}
        </Link>
    );
}

// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConditionalShell } from '@/components/client/conditional-shell';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OPHIM - Xem phim online miễn phí',
  description: 'Xem phim online chất lượng cao với phụ đề tiếng Việt',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="bg-[#0b0b0f] text-zinc-100">
      <body className={`${inter.className} min-h-screen bg-[#0b0b0f] text-zinc-100 antialiased`}>
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
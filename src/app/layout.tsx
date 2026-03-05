// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/client/header';


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
    <html lang="vi">
      <body className={inter.className}>
        {/* Không cần AuthProvider, dùng Header trực tiếp */}
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
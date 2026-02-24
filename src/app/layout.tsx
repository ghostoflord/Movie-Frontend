import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Test Laravel API',
  description: 'Testing Next.js with Laravel API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book Store',
  description: 'Khám phá hàng ngàn đầu sách hấp dẫn với mức giá hợp lý và dịch vụ giao hàng nhanh chóng.',
  icons: {
    icon: [
      {
        url: '/book-icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/book-icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/book-icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/book-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <ThemeProvider defaultTheme="system" storageKey="bookstore-theme">
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}

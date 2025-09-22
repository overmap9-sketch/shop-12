import React from 'react';
import '../global.css';
import { DEFAULT_THEME } from '../shared/themes/types';
import type { Metadata } from 'next';
import { ClientProviders } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_ORIGIN || 'http://localhost:3000'),
  title: {
    default: 'PaintHub – E‑commerce',
    template: '%s · PaintHub'
  },
  description: 'Modern e‑commerce built with Next.js and Tailwind CSS',
  keywords: ['ecommerce', 'shop', 'paint', 'nextjs', 'tailwind'],
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'PaintHub – E‑commerce',
    description: 'Shop paints and accessories',
    url: (process.env.PUBLIC_ORIGIN || 'http://localhost:3000'),
    siteName: 'PaintHub',
    locale: 'en_US',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      es: '/es'
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

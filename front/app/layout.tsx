import React from 'react';
import '../src/global.css';
import { DEFAULT_THEME } from '../src/shared/themes/types';

export const metadata = {
  title: 'E-commerce App',
  description: 'Next.js wrapper for existing React app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}

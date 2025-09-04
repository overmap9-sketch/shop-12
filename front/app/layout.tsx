import React from 'react';
import '../src/global.css';

export const metadata = {
  title: 'E-commerce App',
  description: 'Next.js wrapper for existing React app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}

import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-foreground-muted mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a href="/" className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground">Return to Home</a>
      </div>
    </div>
  );
}

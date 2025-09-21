import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../shared/ui/Button';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ 
  title, 
  description = "This page is under construction. Please check back soon!" 
}: PlaceholderPageProps) {
  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <div className="w-24 h-24 mx-auto mb-6 text-foreground-muted">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {title}
        </h1>
        
        <p className="text-foreground-muted mb-8 text-lg">
          {description}
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-foreground-subtle">
            Continue prompting to have me build out this page with full functionality!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/catalog">Browse Catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

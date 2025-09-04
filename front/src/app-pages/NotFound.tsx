import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "../shared/ui/Button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 mx-auto mb-6 text-foreground-muted">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-foreground-muted mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="space-y-4">
          <Button size="lg" asChild>
            <Link to="/">Return to Home</Link>
          </Button>

          <div className="text-sm text-foreground-subtle">
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

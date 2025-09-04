import React, { Component, ErrorInfo, ReactNode } from 'react';
import { NotificationService } from '../shared/lib/notifications';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Show error notification
    NotificationService.error(
      '🚨 Application Error',
      'Something went wrong. Please refresh the page or try again later.'
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
              <div className="text-destructive text-4xl mb-4">⚠️</div>
              <h2 className="text-lg font-semibold text-destructive mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-4">
                An unexpected error occurred. Please refresh the page to continue.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

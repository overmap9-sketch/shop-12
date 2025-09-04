import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { Button } from '../../shared/ui/Button';
import { Package, Shield } from 'lucide-react';

export function AdminLogin() {
  const { t } = useTranslation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Check if already logged in as admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleLoginRedirect = () => {
    // Redirect to main login page
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Admin Access Required
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please login with an admin account to access the admin panel
          </p>
        </div>

        {/* Login Message */}
        <div className="bg-card border rounded-lg p-6 shadow-lg text-center space-y-6">
          <div className="bg-muted/50 border rounded-md p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              To access the admin panel, please login with admin credentials:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin Email:</strong> admin@example.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>

          <Button
            onClick={handleLoginRedirect}
            className="w-full"
            size="lg"
          >
            Go to Login Page
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            This is an admin-only area. Please login with admin credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

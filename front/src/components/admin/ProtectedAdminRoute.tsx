import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { isAdminRole } from '../../shared/lib/permissions';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to main login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role
  if (!user || !isAdminRole(user.role)) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Component for showing loading state during auth check
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedAdminRoute>{children}</ProtectedAdminRoute>;
}

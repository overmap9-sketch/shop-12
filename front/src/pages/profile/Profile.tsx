import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, selectIsAuthenticated, logout } from '../../features/auth/authSlice';
import { Button } from '../../shared/ui/Button';
import { NotificationService } from '../../shared/lib/notifications';
import { Link, Navigate } from 'react-router-dom';

export function Profile() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
    NotificationService.logoutSuccess();
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-foreground-muted">{user.email}</p>
                {user.phone && (
                  <p className="text-foreground-muted">{user.phone}</p>
                )}
              </div>
            </div>
            
            <Button variant="outline" onClick={handleLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('profile.personalInfo')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground-muted">
                  {t('auth.firstName')}
                </label>
                <p className="text-foreground">{user.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground-muted">
                  {t('auth.lastName')}
                </label>
                <p className="text-foreground">{user.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground-muted">
                  {t('auth.email')}
                </label>
                <p className="text-foreground">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <label className="text-sm font-medium text-foreground-muted">
                    {t('auth.phone')}
                  </label>
                  <p className="text-foreground">{user.phone}</p>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              {t('profile.updateProfile')}
            </Button>
          </div>

          {/* Preferences */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('profile.preferences')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground-muted">
                  {t('profile.language')}
                </label>
                <p className="text-foreground">{user.preferences.language}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground-muted">
                  {t('profile.currency')}
                </label>
                <p className="text-foreground">{user.preferences.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground-muted">
                  {t('profile.theme')}
                </label>
                <p className="text-foreground">{user.preferences.theme}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4">
              Edit Preferences
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/orders">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {t('profile.orderHistory')}
                </Button>
              </Link>
              <Link to="/favourites">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {t('navigation.favourites')}
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  {t('navigation.cart')}
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="w-full justify-start">
                {t('profile.addresses')}
              </Button>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-card border border-border rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user.isEmailVerified ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-sm text-foreground">
                Email {user.isEmailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user.isPhoneVerified ? 'bg-success' : 'bg-muted'}`} />
              <span className="text-sm text-foreground">
                Phone {user.isPhoneVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-foreground">Account Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

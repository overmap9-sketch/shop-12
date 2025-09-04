import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login, selectAuthLoading, selectAuthError, clearError } from '../../features/auth/authSlice';
import { Button } from '../../shared/ui/Button';
import { NotificationService } from '../../shared/lib/notifications';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';

export function Login() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // Show validation notification if there are errors
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      NotificationService.validationError(firstError);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    dispatch(clearError());
    
    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      })).unwrap();

      NotificationService.loginSuccess(result.user.firstName);
      // Redirect to home page on successful login
      navigate('/');
    } catch (error) {
      NotificationService.loginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold text-foreground">EcoShop</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {t('auth.login')}
          </h2>
          <p className="text-foreground-muted">
            Welcome back! Please sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-md bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring transition-theme ${
                  errors.email ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-md bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring transition-theme ${
                  errors.password ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">
                {t('auth.rememberMe')}
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition-colors">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
            loading={loading}
          >
            {loading ? t('common.loading') : t('auth.login')}
          </Button>

          {/* Demo Credentials */}
          <div className="bg-surface border border-border rounded-md p-4">
            <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
            <p className="text-sm text-foreground-muted">Email: demo@example.com</p>
            <p className="text-sm text-foreground-muted">Password: password123</p>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-foreground-muted">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { cn } from '../../shared/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCartItemCount } from '../../features/cart/cartSlice';
import { selectFavouritesCount } from '../../features/favourites/favouritesSlice';
import { selectIsAuthenticated, selectUser, logout } from '../../features/auth/authSlice';
import { SearchInput } from '../../shared/ui/SearchInput';
import { NotificationService } from '../../shared/lib/notifications';
import { buttonVariants } from '../../shared/ui/Button';
import { LanguageSwitcherDropdown } from '../../features/lang-switcher/LanguageSwitcher';
import { ThemeSwitcher } from '../../features/theme-switcher/ThemeSwitcher';
import { CurrencySwitcher } from '../../features/currency/CurrencySwitcher';

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const cartItemCount = useAppSelector(selectCartItemCount);
  const favouritesCount = useAppSelector(selectFavouritesCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-border">
          <div className="flex items-center gap-4">
            <span className="text-foreground-muted">Free color matching • Pro discounts available</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Currency Switcher */}
            <CurrencySwitcher variant="compact" showLabel={false} />
            <LanguageSwitcherDropdown />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PaintHub</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchInput
              onSearch={handleSearch}
              placeholder={t('navigation.search')}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {/* Favourites */}
            <Link
              to="/favourites"
              className="relative p-2 hover:bg-surface-alt rounded-md transition-theme"
              aria-label={t('navigation.favourites')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favouritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favouritesCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-surface-alt rounded-md transition-theme"
              aria-label={t('navigation.cart')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-surface-alt rounded-md transition-theme"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <span className="hidden md:block text-sm">{user.firstName}</span>
                </button>

                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-md shadow-theme-lg z-20">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm hover:bg-surface-alt transition-theme"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('navigation.profile')}
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm hover:bg-surface-alt transition-theme"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {t('profile.orderHistory')}
                        </Link>
                        {(user && user.role && user.role !== 'user') && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm hover:bg-surface-alt transition-theme text-primary font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            🛠️ Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-border" />
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt transition-theme"
                          onClick={() => {
                            setIsMenuOpen(false);
                            dispatch(logout());
                            NotificationService.logoutSuccess();
                          }}
                        >
                          {t('navigation.logout')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className={buttonVariants({ size: 'sm' })}
                >
                  {t('navigation.register')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8 py-3 border-t border-border">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            {t('navigation.home')}
          </Link>
          <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">
            {t('navigation.catalog')}
          </Link>
          <Link to="/categories" className="text-foreground hover:text-primary transition-colors">
            {t('navigation.categories')}
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden ml-auto p-2 hover:bg-surface-alt rounded-md transition-theme"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}

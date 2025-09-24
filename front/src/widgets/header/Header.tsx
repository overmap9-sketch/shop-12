import React, { useState, useEffect } from 'react';
import { Logo } from '../../components/logo/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../core/hooks';
import { selectCartItemCount } from '../../features/cart/cartSlice';
import { selectFavouritesCount } from '../../features/favourites/favouritesSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { SearchInput } from '../../shared/ui/SearchInput';
import { LanguageSwitcherDropdown } from '../../features/lang-switcher/LanguageSwitcher';
import { ThemeSwitcher } from '../../features/theme-switcher/ThemeSwitcher';
import { CurrencySwitcher } from '../../features/currency/CurrencySwitcher';
import { Heart, ShoppingCart, User } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cartItemCount = useAppSelector(selectCartItemCount);
  const favouritesCount = useAppSelector(selectFavouritesCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile menu (slide-over)

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  const mobileMenuId = 'mobile-settings-menu';

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar (hidden on mobile; moved into burger menu) */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm border-b border-border">
          <div className="flex items-center gap-4">
            <span className="text-foreground-muted">Free color matching • Pro discounts available</span>
          </div>
          <div className="flex items-center gap-4">
            <CurrencySwitcher variant="compact" showLabel={false} />
            <LanguageSwitcherDropdown />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Logo />

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-4 md:mx-8">
            <SearchInput
              onSearch={handleSearch}
              placeholder={t('navigation.search')}
              className="w-full"
            />
          </div>

          {/* Desktop actions (hidden on mobile; mobile gets BottomNav) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Favourites */}
            <Link
              to="/favourites"
              className="relative p-2 hover:bg-surface-alt rounded-md transition-theme"
              aria-label={t('navigation.favourites')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favouritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={t('a11y.itemsInFavourites', { count: favouritesCount })}>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={t('a11y.itemsInCart', { count: cartItemCount })}>
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu (desktop) */}
            {mounted && isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-surface-alt rounded-md transition-theme"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  aria-controls="user-menu-popover"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium" aria-hidden="true">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <span className="hidden md:block text-sm">{user.firstName}</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div id="user-menu-popover" role="menu" className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-md shadow-theme-lg z-20">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm hover:bg-surface-alt transition-theme"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {t('navigation.profile')}
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm hover:bg-surface-alt transition-theme"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {t('profile.orderHistory')}
                        </Link>
                        {(user && user.role && user.role !== 'user') && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm hover:bg-surface-alt transition-theme text-primary font-medium"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            🛠️ Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-border" />
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt transition-theme"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            dispatch(logout());
                            NotificationService.logoutSuccess();
                            navigate('/');
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
              <button
                aria-label={t('navigation.login')}
                onClick={() => navigate('/login')}
                className="hidden md:inline-flex p-2 hover:bg-surface-alt rounded-md transition-theme"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile: burger beside search opens settings slide-over */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-md hover:bg-surface-alt transition-theme"
              aria-label={t('navigation.openMenu')}
              aria-expanded={isMenuOpen}
              aria-controls={mobileMenuId}
              onClick={() => setIsMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop navigation (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t border-border" aria-label="Primary">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            {t('navigation.home')}
          </Link>
          <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">
            {t('navigation.catalog')}
          </Link>
          <Link to="/categories" className="text-foreground hover:text-primary transition-colors">
            {t('navigation.categories')}
          </Link>
        </nav>
      </div>

      {/* Mobile slide-over menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            className="fixed right-0 top-0 h-full w-80 max-w-[85%] bg-background z-[70] border-l border-border shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold">{t('navigation.settings')}</h2>
              <button
                type="button"
                className="p-2 rounded-md hover:bg-surface-alt"
                aria-label={t('navigation.closeMenu')}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <CurrencySwitcher variant="compact" showLabel={true} />
              <LanguageSwitcherDropdown />
              <ThemeSwitcher />
            </div>
          </aside>
        </>
      )}
    </header>
  );
}

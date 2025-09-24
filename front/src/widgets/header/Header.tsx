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
          {/* Logo (hidden on mobile, shown in burger menu) */}
          <div className="hidden md:block">
            <Logo />
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-4 md:mx-8">
            <SearchInput
              onSearch={handleSearch}
              placeholder={t('navigation.search')}
              className="w-full"
            />
          </div>

          {/* Desktop actions (hidden on mobile; mobile gets BottomNav) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Favourites */}
            <Link
              to="/favourites"
              className="relative p-2 hover:bg-surface-alt rounded-md transition-theme"
              aria-label={t('navigation.favourites')}
            >
              <Heart className="w-6 h-6" aria-hidden="true" />
              {mounted && favouritesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center" aria-label={t('a11y.itemsInFavourites', { count: favouritesCount })}>
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
              <ShoppingCart className="w-6 h-6" aria-hidden="true" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center" aria-label={t('a11y.itemsInCart', { count: cartItemCount })}>
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Account: mirrors BottomNav behavior */}
            <Link
              to={mounted && isAuthenticated ? '/profile' : '/login'}
              className="relative p-2 hover:bg-surface-alt rounded-md transition-theme"
              aria-label={t('navigation.account')}
            >
              <User className="w-6 h-6" aria-hidden="true" />
            </Link>
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
              <div className="flex items-center gap-3">
                <Logo />
                <h2 className="text-base font-semibold">{t('navigation.settings')}</h2>
              </div>
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

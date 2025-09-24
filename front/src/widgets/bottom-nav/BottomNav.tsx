"use client";
import React from 'react';
import { Link, useLocation } from '../../shared/lib/router-shim';
import { useAppSelector } from '../../core/hooks';
import { selectCartItemCount } from '../../features/cart/cartSlice';
import { selectFavouritesCount } from '../../features/favourites/favouritesSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { Home, Grid3X3, Heart, ShoppingCart, User } from 'lucide-react';

/**
 * Mobile-only bottom navigation bar. Fixed to viewport bottom (md:hidden).
 * Ensures quick access to primary destinations and displays badges for counts.
 */
export function BottomNav() {
  const location = useLocation();
  const cartCount = useAppSelector(selectCartItemCount);
  const favCount = useAppSelector(selectFavouritesCount);
  const isAuth = useAppSelector(selectIsAuthenticated);

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/catalog', label: 'Catalog', icon: Grid3X3 },
    { href: '/favourites', label: 'Favourites', icon: Heart, badge: favCount },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { href: isAuth ? '/profile' : '/login', label: 'Account', icon: User },
  ] as const;

  const isActive = (href: string) => (location.pathname || '').startsWith(href);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border md:hidden"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, badge }) => (
          <li key={href} className="relative">
            <Link
              to={href}
              aria-label={label}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {!!badge && badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

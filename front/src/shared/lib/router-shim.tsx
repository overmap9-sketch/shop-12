"use client";
import React, { forwardRef, useEffect } from 'react';
import NextLink from 'next/link';

// Link shim: supports `to` (react-router) and `href` (Next)
export const Link = forwardRef<HTMLAnchorElement, Omit<React.ComponentProps<typeof NextLink>, 'href'> & { to?: string; href?: string }>(
  ({ to, href, ...props }, ref) => {
    const finalHref = (to ?? href) || '/';
    // @ts-expect-error NextLink accepts ref
    return <NextLink ref={ref as any} href={finalHref} {...props} />;
  }
);
Link.displayName = 'Link';

// useNavigate shim
export function useNavigate() {
  return (to: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = to;
    }
  };
}

// Navigate component shim
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (replace) window.location.replace(to);
      else window.location.href = to;
    }
  }, [to, replace]);
  return null;
}

// useLocation shim (partial) - server-safe: do not call next/navigation hooks during build
export function useLocation() {
  if (typeof window === 'undefined') {
    return { pathname: '', search: '', hash: '' } as const;
  }
  const pathname = window.location.pathname;
  const search = window.location.search || '';
  return {
    pathname,
    search,
    hash: window.location.hash || ''
  } as const;
}

// useParams shim (server-safe)
export function useParams<T extends Record<string, string>>() {
  if (typeof window === 'undefined') {
    return {} as T;
  }
  const parts = window.location.pathname.split('/').filter(Boolean);
  // No real mapping to route params is possible here; return empty
  return {} as T;
}

// useSearchParams shim with setter compatible with react-router-dom (server-safe)
export function useSearchParams(): [URLSearchParams, (init: URLSearchParams | Record<string, string> | string) => void] {
  if (typeof window === 'undefined') {
    return [new URLSearchParams(), () => {}];
  }

  const pathname = window.location.pathname;

  const setSearchParams = (init: URLSearchParams | Record<string, string> | string) => {
    let next = '';
    if (typeof init === 'string') {
      next = init.startsWith('?') ? init : `?${init}`;
    } else if (init instanceof URLSearchParams) {
      next = `?${init.toString()}`;
    } else {
      const usp = new URLSearchParams(init as Record<string, string>);
      next = usp.toString() ? `?${usp.toString()}` : '';
    }
    if (typeof window !== 'undefined') {
      const url = `${pathname}${next}`;
      window.history.pushState({}, '', url);
    }
  };

  const current = new URLSearchParams(window.location.search || '');
  return [current, setSearchParams];
}

// BrowserRouter shim (no-op wrapper)
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Outlet shim - not used in Next, components should use `{children}` in layouts
export function Outlet() {
  return null;
}

// Routes and Route shims for compatibility
export function Routes({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
export function Route(_: any) {
  return null;
}

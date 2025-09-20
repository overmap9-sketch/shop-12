"use client";
import React, { forwardRef, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

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
  const router = useRouter();
  return (to: string) => router.push(to);
}

// Navigate component shim
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}

// useLocation shim (partial)
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const search = searchParams.toString();
  return {
    pathname,
    search: search ? `?${search}` : '',
    hash: ''
  } as const;
}

// useParams shim (always call hook to keep consistent hook order)
export function useParams<T extends Record<string, string>>() {
  // @ts-ignore - Next's useParams returns a read-only object
  const params = (useNextParams() as any) || {};
  return params as T;
}

// useSearchParams shim with setter compatible with react-router-dom
export function useSearchParams(): [URLSearchParams, (init: URLSearchParams | Record<string, string> | string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useNextSearchParams();

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
    router.push(`${pathname}${next}`);
  };

  // Create a mutable URLSearchParams from Next's readonly
  const current = new URLSearchParams(searchParams.toString());
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

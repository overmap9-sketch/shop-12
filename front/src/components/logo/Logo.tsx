import React from 'react';
import { Link } from '../../shared/lib/router-shim';
import { cn } from '../../shared/lib/utils';

export type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  className?: string;
  withText?: boolean;
  size?: LogoSize;
  to?: string;
  asLink?: boolean;
}

const sizeMap = {
  sm: { mark: 'w-6 h-6 text-base', text: 'text-lg' },
  md: { mark: 'w-8 h-8 text-lg', text: 'text-xl' },
  lg: { mark: 'w-10 h-10 text-xl', text: 'text-2xl' },
} as const;

export function Logo({ className, withText = true, size = 'md', to = '/', asLink = true }: LogoProps) {
  const Wrapper: React.ElementType = asLink ? Link : 'div';
  const { mark, text } = sizeMap[size];

  return (
    <Wrapper to={to} className={cn('inline-flex items-center gap-2', className)} aria-label="PaintHub home">
      <div className={cn('bg-primary rounded-md flex items-center justify-center', mark)}>
        <span className="text-primary-foreground font-bold">P</span>
      </div>
      {withText && (
        <span className={cn('font-bold text-foreground', text)}>PaintHub</span>
      )}
    </Wrapper>
  );
}

export default Logo;

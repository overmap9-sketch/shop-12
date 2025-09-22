import React from 'react';
import { Product } from '../../entities';

/**
 * Server-rendered product grid for SEO and fast TTFB. Images include fixed dimensions
 * and responsive sizes to minimize CLS. Client interactivity is provided by the
 * client-side Catalog components.
 */
export function ProductGridServer({ products, columns = 4 }: { products: Product[]; columns?: 2|3|4|5 }) {
  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  };
  const sizes = '(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((p) => (
        <article key={p.id} className="group relative bg-card border border-border rounded-lg overflow-hidden transition-theme h-full flex flex-col">
          <a href={`/product/${p.slug || p.id}`} className="block" aria-label={p.title}>
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={(p.images && p.images[0]) || '/placeholder.svg'}
                alt={p.title}
                className="object-cover w-full h-full"
                loading="lazy"
                decoding="async"
                width={800}
                height={800}
                sizes={sizes}
              />
            </div>
          </a>
          <div className="p-4">
            {p.brand && <p className="text-sm text-foreground-muted mb-1">{p.brand}</p>}
            <a href={`/product/${p.slug || p.id}`} className="block">
              <h3 className="font-medium text-foreground mb-2 line-clamp-2">{p.title}</h3>
            </a>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{p.price?.toFixed?.(2) ?? p.price}</span>
              {p.originalPrice && p.originalPrice > p.price && (
                <span className="text-sm text-foreground-muted line-through">{p.originalPrice.toFixed?.(2) ?? p.originalPrice}</span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

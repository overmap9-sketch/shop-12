import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product } from '../../entities';
import { Button } from './Button';
import { Badge } from '../../components/ui/badge';
import { useProductPrice } from '../../hooks/use-currency';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToFavourites?: (productId: string) => void;
  onRemoveFromFavourites?: (productId: string) => void;
  isFavourite?: boolean;
  className?: string;
  showQuickActions?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToFavourites,
  onRemoveFromFavourites,
  isFavourite = false,
  className = '',
  showQuickActions = true,
}: ProductCardProps) {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageHover = () => {
    if (product.images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % product.images.length;
      setCurrentImageIndex(nextIndex);
    }
  };

  const handleImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (product.images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(Math.max(x / rect.width, 0), 1);
    const idx = Math.min(Math.max(Math.floor(ratio * product.images.length), 0), product.images.length - 1);
    if (idx !== currentImageIndex) setCurrentImageIndex(idx);
  };

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavourite && onRemoveFromFavourites) {
      onRemoveFromFavourites(product.id);
    } else if (!isFavourite && onAddToFavourites) {
      onAddToFavourites(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const { price, originalPrice, discount } = useProductPrice(product.price, product.originalPrice);

  return (
    <div
      className={`group relative bg-card border border-border rounded-lg overflow-hidden transition-theme hover:shadow-theme-md h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted" onMouseMove={handleImageMove}>
          <img
            src={product.images[currentImageIndex] || '/placeholder.svg'}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            onMouseEnter={handleImageHover}
            loading="lazy"
            decoding="async"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge variant="secondary" className="bg-success text-success-foreground">
                {t('product.new')}
              </Badge>
            )}
            {product.isOnSale && discount?.percentage && discount.percentage > 0 && (
              <Badge variant="destructive">
                -{discount.percentage}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="default">
                {t('product.featured')}
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">
                {t('product.outOfStock')}
              </Badge>
            </div>
          )}


          {/* Favourite Button */}
          {showQuickActions && (
            <button
              onClick={handleFavouriteClick}
              className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-theme"
              aria-label={isFavourite ? t('product.removeFromFavourites') : t('product.addToFavourites')}
            >
              <svg
                className={`w-5 h-5 ${isFavourite ? 'text-destructive fill-current' : 'text-foreground-muted'}`}
                fill={isFavourite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}

          {/* Image Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-foreground' : 'bg-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
        <div className="p-4 h-full flex flex-col">
          <div className="flex-1">
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-foreground-muted mb-1">{product.brand}</p>
            )}

            {/* Title */}
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
            </Link>

            {/* Paint quick specs */}
            {product.specifications && (
              <div className="flex items-center gap-3 mb-2 text-xs text-foreground-muted">
                {product.specifications['Color Hex'] && (
                  <span
                    className="inline-block w-4 h-4 rounded-full border"
                    style={{ backgroundColor: product.specifications['Color Hex'] }}
                    title={product.specifications['Color'] || 'Color'}
                  />
                )}
                {product.specifications['Color'] && (
                  <span className="truncate max-w-[8rem]">{product.specifications['Color']}</span>
                )}
                {product.specifications['Finish'] && (
                  <span className="px-1.5 py-0.5 border rounded hidden sm:inline">{product.specifications['Finish']}</span>
                )}
                {product.specifications['Volume'] && (
                  <span className="px-1.5 py-0.5 border rounded hidden sm:inline">{product.specifications['Volume']}</span>
                )}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-muted'
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-foreground-muted">
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                {price.formatted}
              </span>
              {originalPrice && discount?.percentage && discount.percentage > 0 && (
                <span className="text-sm text-foreground-muted line-through">
                  {originalPrice.formatted}
                </span>
              )}
            </div>
          </div>

          {/* Actions aligned to bottom */}
          <div className="mt-3">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full"
            >
              {product.stock === 0 ? t('product.outOfStock') : t('product.addToCart')}
            </Button>
          </div>
        </div>
    </div>
  );
}

// Loading skeleton for ProductCard
export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton-text h-3 w-1/3" />
        <div className="skeleton-title" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 skeleton rounded-full" />
          ))}
        </div>
        <div className="skeleton-text h-5 w-1/2" />
      </div>
    </div>
  );
}

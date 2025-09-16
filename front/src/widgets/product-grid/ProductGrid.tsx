import React from 'react';
import { Product } from '../../entities';
import { ProductCard, ProductCardSkeleton } from '../../shared/ui/ProductCard';
import { ProductGridItem } from './ProductGridItem';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { addToFavourites, removeFromFavourites, selectIsFavourite } from '../../features/favourites/favouritesSlice';
import { NotificationService } from '../../shared/lib/notifications';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  showQuickActions?: boolean;
  skeletonCount?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductGrid({
  products,
  loading = false,
  columns = 4,
  showQuickActions = true,
  skeletonCount = 8,
  viewMode = 'grid'
}: ProductGridProps) {
  const dispatch = useAppDispatch();
  const favouriteIds = useAppSelector(state => new Set((state as any).favourites.items.map((i: any) => i.productId)));

  const handleAddToCart = async (productId: string) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      NotificationService.addToCartSuccess();
    } catch (error) {
      NotificationService.cartError(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleAddToFavourites = async (productId: string) => {
    try {
      await dispatch(addToFavourites(productId)).unwrap();
      NotificationService.addToFavouritesSuccess();
    } catch (error) {
      NotificationService.favouritesError(error instanceof Error ? error.message : 'Failed to add to favourites');
    }
  };

  const handleRemoveFromFavourites = async (productId: string) => {
    try {
      await dispatch(removeFromFavourites(productId)).unwrap();
      NotificationService.removeFromFavouritesSuccess();
    } catch (error) {
      NotificationService.favouritesError(error instanceof Error ? error.message : 'Failed to remove from favourites');
    }
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  };

  if (loading) {
    return (
      <div className={viewMode === 'grid' ? `grid ${gridCols[columns]} gap-6` : 'space-y-4'}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-foreground-muted">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m16 0l-2-2m0 0l-2 2m2-2v4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
        <p className="text-foreground-muted">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? `grid ${gridCols[columns]} gap-6` : 'space-y-4'}>
      {products.map((product) => {
        if (viewMode === 'list') {
          return (
            <ProductGridItem
              key={product.id}
              product={product}
              viewMode={viewMode}
              loading={loading}
            />
          );
        }

        const isFavourite = favouriteIds.has(product.id);

        return (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onAddToFavourites={handleAddToFavourites}
            onRemoveFromFavourites={handleRemoveFromFavourites}
            isFavourite={isFavourite}
            showQuickActions={showQuickActions}
          />
        );
      })}
    </div>
  );
}

// Responsive product grid that adapts to screen size
export function ResponsiveProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  const dispatch = useAppDispatch();
  const favouriteIds = useAppSelector(state => new Set((state as any).favourites.items.map((i: any) => i.productId)));
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
      {loading
        ? Array.from({ length: 10 }, (_, index) => <ProductCardSkeleton key={index} />)
        : products.map((product) => {
            const isFavourite = favouriteIds.has(product.id);
            
            return (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(productId) => dispatch(addToCart({ productId, quantity: 1 }))}
                onAddToFavourites={(productId) => dispatch(addToFavourites(productId))}
                onRemoveFromFavourites={(productId) => dispatch(removeFromFavourites(productId))}
                isFavourite={isFavourite}
              />
            );
          })}
    </div>
  );
}

import React from 'react';
import { ProductCard } from '../../shared/ui/ProductCard';
import { Product } from '../../entities';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../core/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import { addToFavourites, removeFromFavourites, selectIsFavourite } from '../../features/favourites/favouritesSlice';
import { NotificationService } from '../../shared/lib/notifications';
import { useProductPrice } from '../../hooks/use-currency';

interface ProductGridItemProps {
  product: Product;
  viewMode: 'grid' | 'list';
  loading?: boolean;
}

export function ProductGridItem({ product, viewMode, loading = false }: ProductGridItemProps) {
  const dispatch = useAppDispatch();
  const isFavourite = useAppSelector(selectIsFavourite(product.id));
  const { price, originalPrice, discount } = useProductPrice(product.price, product.originalPrice);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      NotificationService.addToCartSuccess(product.title);
    } catch (error) {
      NotificationService.cartError(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isFavourite) {
        await dispatch(removeFromFavourites(product.id)).unwrap();
        NotificationService.removeFromFavouritesSuccess(product.title);
      } else {
        await dispatch(addToFavourites(product.id)).unwrap();
        NotificationService.addToFavouritesSuccess(product.title);
      }
    } catch (error) {
      NotificationService.favouritesError(error instanceof Error ? error.message : 'Failed to update favourites');
    }
  };

  if (viewMode === 'grid') {
    return <ProductCard product={product} loading={loading} />;
  }

  // List view
  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-grow min-w-0 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">
                {product.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavourite}
              className="p-2 h-auto"
            >
              <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {product.brand && (
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {product.isOnSale && (
              <Badge variant="destructive" className="text-xs">
                Sale
              </Badge>
            )}
            {product.isNew && (
              <Badge className="text-xs bg-green-500 hover:bg-green-600">
                New
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex-shrink-0 sm:text-right text-left space-y-2">
          <div>
          <div className="text-lg font-bold text-foreground">
            {price.formatted}
          </div>
          {originalPrice && discount?.percentage && discount.percentage > 0 && (
            <div className="text-sm text-muted-foreground line-through">
              {originalPrice.formatted}
            </div>
          )}
        </div>

          <div className="space-y-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || loading}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

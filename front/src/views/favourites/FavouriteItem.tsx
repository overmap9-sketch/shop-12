import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Favourite } from '../../entities';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';

interface FavouriteItemProps {
  favourite: Favourite;
  onRemoveFromFavourites: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  viewMode?: 'grid' | 'list';
}

export function FavouriteItem({ 
  favourite, 
  onRemoveFromFavourites, 
  onAddToCart,
  viewMode = 'grid' 
}: FavouriteItemProps) {
  const { t } = useTranslation();
  const { product } = favourite;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Link to={`/product/${product.id}`}>
              <div className="w-20 h-20 bg-muted rounded-md overflow-hidden">
                <img
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </Link>
          </div>

          {/* Product Info */}
          <div className="flex-grow min-w-0 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <Link 
                  to={`/product/${product.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFromFavourites(product.id)}
                className="text-destructive hover:text-destructive p-2"
                title="Remove from favourites"
              >
                <Trash2 className="h-4 w-4" />
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-foreground">
                  ${product.price}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Added {formatDate(favourite.dateAdded)}
                </span>
                <Button
                  onClick={() => onAddToCart(product.id)}
                  disabled={product.stock === 0}
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (card format)
  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
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

        {/* Remove from favourites button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveFromFavourites(product.id)}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-destructive hover:text-destructive p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4 fill-current" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <Link 
            to={`/product/${product.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
          >
            {product.title}
          </Link>
          {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-foreground">
              ${product.price}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(favourite.dateAdded)}
          </div>
        </div>

        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock === 0}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}

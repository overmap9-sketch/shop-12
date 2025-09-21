import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { 
  selectFavourites, 
  selectFavouritesLoading, 
  selectFavouritesError,
  fetchFavourites,
  removeFromFavourites,
  clearFavourites
} from '../../features/favourites/favouritesSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ProductGrid } from '../../widgets/product-grid/ProductGrid';
import { NotificationService } from '../../shared/lib/notifications';
import { FavouriteItem } from './FavouriteItem';
import { Heart, ShoppingCart, Trash2, Grid, List, Filter, Search } from 'lucide-react';

export function Favourites() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const favourites = useAppSelector(selectFavourites);
  const loading = useAppSelector(selectFavouritesLoading);
  const error = useAppSelector(selectFavouritesError);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'name' | 'price'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    dispatch(fetchFavourites());
  }, [dispatch]);

  // Filter and sort favourites
  const filteredAndSortedFavourites = React.useMemo(() => {
    let filtered = favourites.filter(favourite =>
      favourite.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favourite.product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favourite.product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aValue: any = a.product.title;
      let bValue: any = b.product.title;

      switch (sortBy) {
        case 'dateAdded':
          aValue = new Date(a.dateAdded).getTime();
          bValue = new Date(b.dateAdded).getTime();
          break;
        case 'name':
          aValue = a.product.title.toLowerCase();
          bValue = b.product.title.toLowerCase();
          break;
        case 'price':
          aValue = a.product.price;
          bValue = b.product.price;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [favourites, searchQuery, sortBy, sortOrder]);

  const handleRemoveFromFavourites = async (productId: string) => {
    try {
      const favourite = favourites.find(fav => fav.productId === productId);
      await dispatch(removeFromFavourites(productId)).unwrap();
      NotificationService.removeFromFavouritesSuccess(favourite?.product.title);
    } catch (error) {
      NotificationService.favouritesError(error instanceof Error ? error.message : 'Failed to remove from favourites');
    }
  };

  const handleClearAllFavourites = async () => {
    if (window.confirm('Are you sure you want to remove all items from your favourites?')) {
      try {
        await dispatch(clearFavourites()).unwrap();
        NotificationService.success('Favourites Cleared', 'All items removed from favourites');
      } catch (error) {
        NotificationService.favouritesError(error instanceof Error ? error.message : 'Failed to clear favourites');
      }
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const favourite = favourites.find(fav => fav.productId === productId);
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      NotificationService.addToCartSuccess(favourite?.product.title);
    } catch (error) {
      NotificationService.cartError(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleAddAllToCart = async () => {
    try {
      const addPromises = filteredAndSortedFavourites.map(favourite =>
        dispatch(addToCart({ productId: favourite.productId, quantity: 1 })).unwrap()
      );
      
      await Promise.all(addPromises);
      NotificationService.success(
        'Added to Cart', 
        `${filteredAndSortedFavourites.length} items added to cart`
      );
    } catch (error) {
      NotificationService.cartError('Failed to add some items to cart');
    }
  };

  // Loading state
  if (loading && favourites.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('favourites.loading', 'Loading favourites...')} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2">
                {t('favourites.errorTitle', 'Error Loading Favourites')}
              </h2>
              <p className="mb-4">{error}</p>
              <Button onClick={() => dispatch(fetchFavourites())}>
                {t('common.tryAgain', 'Try Again')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('favourites.title', 'My Favourites')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('favourites.subtitle', 'Manage your favourite products')}
          </p>
        </div>

        {/* Empty State */}
        {favourites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-muted-foreground">
              <Heart className="w-full h-full" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('favourites.emptyTitle', 'No Favourites Yet')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('favourites.emptyMessage', 'Start adding products to your favourites by clicking the heart icon on any product.')}
            </p>
            <Link to="/catalog">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {t('favourites.browseCatalog', 'Browse Catalog')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-card border rounded-lg p-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side - Search and filters */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder={t('favourites.searchPlaceholder', 'Search favourites...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Sort controls */}
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="dateAdded">{t('favourites.sortByDateAdded', 'Date Added')}</option>
                      <option value="name">{t('favourites.sortByName', 'Name')}</option>
                      <option value="price">{t('favourites.sortByPrice', 'Price')}</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-border rounded-md bg-background hover:bg-muted transition-colors"
                      title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>

                {/* Right side - Actions and view controls */}
                <div className="flex items-center gap-3">
                  {/* Bulk actions */}
                  {filteredAndSortedFavourites.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddAllToCart}
                        disabled={loading}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t('favourites.addAllToCart', 'Add All to Cart')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllFavourites}
                        disabled={loading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('favourites.clearAll', 'Clear All')}
                      </Button>
                    </div>
                  )}

                  {/* View mode toggle */}
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? (
                    t('favourites.searchResults', 
                      `Showing ${filteredAndSortedFavourites.length} of ${favourites.length} favourites`,
                      { 
                        showing: filteredAndSortedFavourites.length, 
                        total: favourites.length 
                      }
                    )
                  ) : (
                    t('favourites.totalCount', 
                      `${favourites.length} favourite${favourites.length !== 1 ? 's' : ''}`,
                      { count: favourites.length }
                    )
                  )}
                </p>
              </div>
            </div>

            {/* Products */}
            {filteredAndSortedFavourites.length > 0 ? (
              <ProductGrid 
                products={filteredAndSortedFavourites.map(fav => fav.product)}
                loading={loading}
                viewMode={viewMode}
                columns={viewMode === 'grid' ? 4 : 3}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                  <Search className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('favourites.noSearchResults', 'No favourites match your search')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('favourites.tryDifferentSearch', 'Try adjusting your search terms')}
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  {t('favourites.clearSearch', 'Clear Search')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

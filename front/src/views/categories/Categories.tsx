import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { 
  selectCategories, 
  selectCategoriesLoading, 
  fetchCategories 
} from '../../features/catalog/catalogSlice';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../shared/ui/Button';
import { Grid, ArrowRight, Package, Layers } from 'lucide-react';

export function Categories() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectCategoriesLoading);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parentId && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('categories.loading', 'Loading categories...')} />
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
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('categories.title', 'Categories')}
            </h1>
          </div>
          <p className="text-muted-foreground mb-6">
            {t('categories.subtitle', 'Browse products by category and discover what you need')}
          </p>
          
          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t('categories.viewMode', 'View:')}
            </span>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r"
              >
                <Grid className="h-4 w-4 mr-2" />
                {t('categories.gridView', 'Grid')}
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <Package className="h-4 w-4 mr-2" />
                {t('categories.listView', 'List')}
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              
              return (
                <div key={category.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Category Image */}
                  {category.image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Category Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <Badge variant="secondary">
                        {category.productCount} {t('categories.products', 'products')}
                      </Badge>
                    </div>
                    
                    {category.description && (
                      <p className="text-muted-foreground mb-4 text-sm">
                        {category.description}
                      </p>
                    )}
                    
                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          {t('categories.subcategories', 'Subcategories')}:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {subcategories.slice(0, 4).map((subcat) => (
                            <Link
                              key={subcat.id}
                              to={`/catalog?category=${category.slug}&subcategory=${subcat.slug}`}
                            >
                              <Badge 
                                variant="outline" 
                                className="text-xs hover:bg-muted transition-colors cursor-pointer"
                              >
                                {subcat.name}
                              </Badge>
                            </Link>
                          ))}
                          {subcategories.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{subcategories.length - 4} {t('categories.more', 'more')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={`/catalog?category=${category.slug}`} className="flex-1">
                        <Button className="w-full">
                          {t('categories.viewAll', 'View All')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {mainCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              
              return (
                <div key={category.id} className="bg-card border rounded-lg p-6">
                  <div className="flex gap-6">
                    {/* Category Image */}
                    {category.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    
                    {/* Category Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-semibold text-foreground">
                          {category.name}
                        </h3>
                        <Badge variant="secondary" className="text-sm">
                          {category.productCount} {t('categories.products', 'products')}
                        </Badge>
                      </div>
                      
                      {category.description && (
                        <p className="text-muted-foreground mb-4">
                          {category.description}
                        </p>
                      )}
                      
                      {/* Subcategories Grid */}
                      {subcategories.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">
                            {t('categories.subcategories', 'Subcategories')}:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {subcategories.map((subcat) => (
                              <Link
                                key={subcat.id}
                                to={`/catalog?category=${category.slug}&subcategory=${subcat.slug}`}
                                className="group"
                              >
                                <div className="p-3 border rounded-md hover:bg-muted transition-colors cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                      {subcat.name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {subcat.productCount}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link to={`/catalog?category=${category.slug}`}>
                          <Button>
                            {t('categories.viewAll', 'View All')} {category.name}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/catalog?featured=true">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">⭐ {t('categories.featured', 'Featured Products')}</h3>
              <p className="text-sm opacity-90">{t('categories.featuredDesc', 'Discover our hand-picked featured products')}</p>
            </div>
          </Link>
          
          <Link to="/catalog?sale=true">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-lg text-white hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">🏷️ {t('categories.sale', 'On Sale')}</h3>
              <p className="text-sm opacity-90">{t('categories.saleDesc', 'Great deals and discounts await you')}</p>
            </div>
          </Link>
          
          <Link to="/catalog?new=true">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">✨ {t('categories.new', 'New Arrivals')}</h3>
              <p className="text-sm opacity-90">{t('categories.newDesc', 'Check out our latest products')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

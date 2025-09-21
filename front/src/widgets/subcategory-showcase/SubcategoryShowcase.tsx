import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { fetchCategories, selectCategories, selectCategoriesLoading } from '../../features/catalog/catalogSlice';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../shared/ui/Button';
import { ChevronRight, Grid, ArrowRight } from 'lucide-react';

interface SubcategoryShowcaseProps {
  maxCategories?: number;
  maxSubcategories?: number;
  showImages?: boolean;
  className?: string;
}

export function SubcategoryShowcase({ 
  maxCategories = 3, 
  maxSubcategories = 6, 
  showImages = true,
  className = '' 
}: SubcategoryShowcaseProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const categories = useAppSelector(selectCategories);
  const loading = useAppSelector(selectCategoriesLoading);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parentId && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, maxCategories);
  
  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Auto-select first category if none selected
  useEffect(() => {
    if (mainCategories.length > 0 && !activeCategory) {
      setActiveCategory(mainCategories[0].id);
    }
  }, [mainCategories, activeCategory]);

  if (loading) {
    return (
      <div className={`bg-card border rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" text={t('categories.loading', 'Loading categories...')} />
        </div>
      </div>
    );
  }

  const activeMainCategory = mainCategories.find(cat => cat.id === activeCategory);
  const activeSubcategories = activeCategory ? getSubcategories(activeCategory) : [];

  return (
    <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {t('subcategories.explore', 'Explore by Category')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('subcategories.subtitle', 'Browse our organized product categories')}
              </p>
            </div>
          </div>
          <Link to="/categories">
            <Button variant="outline" size="sm">
              {t('categories.viewAll', 'View All')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Category Tabs */}
        <div className="w-1/3 border-r">
          <div className="p-4 space-y-2">
            {mainCategories.map((category) => {
              const subcategoriesCount = getSubcategories(category.id).length;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className={`text-sm ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {subcategoriesCount} {t('categories.subcategories', 'subcategories')}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Display */}
        <div className="flex-1 p-6">
          {activeMainCategory && (
            <>
              {/* Category Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-3">
                  {showImages && activeMainCategory.image && (
                    <img
                      src={activeMainCategory.image}
                      alt={activeMainCategory.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {activeMainCategory.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activeMainCategory.description || `Browse ${activeMainCategory.name.toLowerCase()}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Link to={`/catalog?category=${activeMainCategory.slug}`}>
                    <Button size="sm">
                      {t('categories.viewAll', 'View All')} {activeMainCategory.name}
                    </Button>
                  </Link>
                  <Badge variant="secondary">
                    {activeMainCategory.productCount} {t('categories.products', 'products')}
                  </Badge>
                </div>
              </div>

              {/* Subcategories Grid */}
              {activeSubcategories.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {activeSubcategories.slice(0, maxSubcategories).map((subcat) => (
                    <Link
                      key={subcat.id}
                      to={`/catalog?category=${activeMainCategory.slug}&subcategory=${subcat.slug}`}
                      className="group p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {subcat.name}
                          </div>
                          {subcat.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {subcat.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge variant="outline" className="text-xs">
                            {subcat.productCount}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {activeSubcategories.length > maxSubcategories && (
                    <Link
                      to={`/catalog?category=${activeMainCategory.slug}`}
                      className="p-3 border border-dashed rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      +{activeSubcategories.length - maxSubcategories} {t('categories.more', 'more')}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Grid className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {t('subcategories.noSubcategories', 'No subcategories available')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function SubcategoryShowcaseCompact({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const categories = useAppSelector(selectCategories);
  
  // Get all subcategories from all main categories
  const allSubcategories = categories
    .filter(cat => cat.parentId && cat.isActive)
    .sort(() => Math.random() - 0.5) // Randomize
    .slice(0, 8);

  return (
    <div className={`bg-card border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          {t('subcategories.popular', 'Popular Subcategories')}
        </h3>
        <Link to="/categories">
          <Button variant="ghost" size="sm">
            {t('categories.viewAll', 'View All')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {allSubcategories.map((subcat) => {
          const parentCategory = categories.find(cat => cat.id === subcat.parentId);
          
          return (
            <Link
              key={subcat.id}
              to={`/catalog?category=${parentCategory?.slug}&subcategory=${subcat.slug}`}
              className="group p-3 border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                {subcat.name}
              </div>
              <Badge variant="outline" className="text-xs">
                {subcat.productCount}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

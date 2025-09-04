import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCategories, fetchCategories } from './catalogSlice';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../shared/ui/Button';
import { ChevronDown, ChevronRight, Grid, List } from 'lucide-react';

interface SubcategoryNavigationProps {
  selectedCategory?: string;
  selectedSubcategory?: string;
  onCategoryChange?: (categorySlug: string) => void;
  onSubcategoryChange?: (subcategorySlug: string) => void;
  className?: string;
}

export function SubcategoryNavigation({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  className = ''
}: SubcategoryNavigationProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const categories = useAppSelector(selectCategories);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    selectedCategory ? new Set([selectedCategory]) : new Set()
  );

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parentId && cat.isActive);
  
  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Get current category info
  const currentCategory = selectedCategory 
    ? categories.find(cat => cat.slug === selectedCategory)
    : null;

  const currentSubcategory = selectedSubcategory 
    ? categories.find(cat => cat.slug === selectedSubcategory)
    : null;

  const toggleCategoryExpansion = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categorySlug: string) => {
    if (onCategoryChange) {
      onCategoryChange(categorySlug);
    }
    toggleCategoryExpansion(categorySlug);
  };

  const handleSubcategoryClick = (subcategorySlug: string) => {
    if (onSubcategoryChange) {
      onSubcategoryChange(subcategorySlug);
    }
  };

  return (
    <div className={`bg-card border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Grid className="h-4 w-4" />
          {t('catalog.categories', 'Categories')}
        </h3>
        {(currentCategory || currentSubcategory) && (
          <div className="mt-2 text-sm text-muted-foreground">
            {currentCategory && (
              <>
                <Link 
                  to="/catalog" 
                  className="hover:text-foreground transition-colors"
                >
                  {t('catalog.allCategories', 'All Categories')}
                </Link>
                <span className="mx-2">→</span>
                <span className="font-medium text-foreground">{currentCategory.name}</span>
              </>
            )}
            {currentSubcategory && (
              <>
                <span className="mx-2">→</span>
                <span className="font-medium text-primary">{currentSubcategory.name}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Category Tree */}
      <div className="p-4">
        <div className="space-y-1">
          {/* All Categories Option */}
          <Link to="/catalog">
            <Button
              variant={!selectedCategory ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start font-normal"
            >
              <Grid className="h-4 w-4 mr-2" />
              {t('catalog.allCategories', 'All Categories')}
            </Button>
          </Link>

          {/* Main Categories */}
          {mainCategories.map((category) => {
            const subcategories = getSubcategories(category.id);
            const isExpanded = expandedCategories.has(category.slug);
            const isSelected = selectedCategory === category.slug;
            
            return (
              <div key={category.id} className="space-y-1">
                {/* Main Category */}
                <div className="flex items-center">
                  <Button
                    variant={isSelected && !selectedSubcategory ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 justify-start font-normal"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <div className="flex items-center flex-1">
                      <span className="flex-1 text-left">{category.name}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.productCount}
                      </Badge>
                    </div>
                  </Button>
                  
                  {subcategories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-1 h-8 w-8"
                      onClick={() => toggleCategoryExpansion(category.slug)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && subcategories.length > 0 && (
                  <div className="ml-4 space-y-1 border-l border-border pl-4">
                    {subcategories.map((subcategory) => {
                      const isSubSelected = selectedSubcategory === subcategory.slug;
                      
                      return (
                        <Link
                          key={subcategory.id}
                          to={`/catalog?category=${category.slug}&subcategory=${subcategory.slug}`}
                        >
                          <Button
                            variant={isSubSelected ? 'default' : 'ghost'}
                            size="sm"
                            className="w-full justify-start font-normal text-sm"
                            onClick={() => handleSubcategoryClick(subcategory.slug)}
                          >
                            <span className="flex-1 text-left">{subcategory.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {subcategory.productCount}
                            </Badge>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Link to="/catalog?featured=true">
            <Button variant="outline" size="sm" className="w-full justify-start">
              ⭐ {t('catalog.featured', 'Featured Products')}
            </Button>
          </Link>
          <Link to="/catalog?sale=true">
            <Button variant="outline" size="sm" className="w-full justify-start">
              🏷️ {t('catalog.onSale', 'On Sale')}
            </Button>
          </Link>
          <Link to="/catalog?new=true">
            <Button variant="outline" size="sm" className="w-full justify-start">
              ✨ {t('catalog.newProducts', 'New Products')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function SubcategoryBreadcrumb({
  selectedCategory,
  selectedSubcategory,
  className = ''
}: {
  selectedCategory?: string;
  selectedSubcategory?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const categories = useAppSelector(selectCategories);

  const currentCategory = selectedCategory 
    ? categories.find(cat => cat.slug === selectedCategory)
    : null;

  const currentSubcategory = selectedSubcategory 
    ? categories.find(cat => cat.slug === selectedSubcategory)
    : null;

  if (!currentCategory && !currentSubcategory) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
      <Link to="/catalog" className="hover:text-foreground transition-colors">
        {t('catalog.allCategories', 'All Categories')}
      </Link>
      
      {currentCategory && (
        <>
          <ChevronRight className="h-3 w-3" />
          <Link
            to={`/catalog?category=${currentCategory.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {currentCategory.name}
          </Link>
        </>
      )}
      
      {currentSubcategory && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">
            {currentSubcategory.name}
          </span>
        </>
      )}
    </nav>
  );
}

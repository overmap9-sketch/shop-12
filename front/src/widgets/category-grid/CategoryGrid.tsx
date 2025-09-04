import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchCategories, selectCategories, selectCategoriesLoading } from '../../features/catalog/catalogSlice';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Badge } from '../../components/ui/badge';
import { ChevronRight } from 'lucide-react';

export function CategoryGrid() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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
    .slice(0, 6);

  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 4); // Show max 4 subcategories in hover
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="aspect-square skeleton" />
            <div className="p-4">
              <div className="skeleton-text h-4 mb-2" />
              <div className="skeleton-text h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {mainCategories.map((category) => {
        const subcategories = getSubcategories(category.id);
        const isHovered = hoveredCategory === category.id;

        return (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link
              to={`/catalog?category=${category.slug}`}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-theme-md transition-all hover:scale-105 block"
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="w-12 h-12 text-primary">
                      <CategoryIcon categorySlug={category.slug} />
                    </div>
                  </div>
                )}

                {/* Subcategory count indicator */}
                {subcategories.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      +{subcategories.length}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4 text-center">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-foreground-muted">
                  {category.productCount} {category.productCount === 1 ? t('product.title').toLowerCase() : t('product.products').toLowerCase()}
                </p>
              </div>
            </Link>

            {/* Subcategories Dropdown */}
            {isHovered && subcategories.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-theme-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    {t('categories.subcategories', 'Subcategories')}:
                  </div>
                  {subcategories.map((subcat) => (
                    <Link
                      key={subcat.id}
                      to={`/catalog?category=${category.slug}&subcategory=${subcat.slug}`}
                      className="flex items-center justify-between px-2 py-1 rounded text-sm hover:bg-muted transition-colors group/sub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-foreground group-hover/sub:text-primary transition-colors">
                        {subcat.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {subcat.productCount}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/sub:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                  {categories.filter(cat => cat.parentId === category.id && cat.isActive).length > 4 && (
                    <Link
                      to={`/categories`}
                      className="flex items-center justify-center px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded transition-colors"
                    >
                      {t('categories.viewAll', 'View All')}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Category icon component based on category slug
function CategoryIcon({ categorySlug }: { categorySlug: string }) {
  const iconMap: Record<string, JSX.Element> = {
    electronics: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    clothing: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    'home-garden': (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    sports: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    books: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    'health-beauty': (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  };

  return iconMap[categorySlug] || (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

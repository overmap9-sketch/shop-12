import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../core/hooks';
import { selectCategories } from '../features/catalog/catalogSlice';
import { Product, Category } from '../entities';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from './ui/breadcrumb';
import { Home } from 'lucide-react';

interface ProductBreadcrumbProps {
  product: Product;
  showProductName?: boolean;
  includeHome?: boolean;
  className?: string;
}

export function ProductBreadcrumb({
  product,
  showProductName = true,
  includeHome = true,
  className = ''
}: ProductBreadcrumbProps) {
  const { t } = useTranslation();
  const categories = useAppSelector(selectCategories);

  // Find main category
  const mainCategory = categories.find(cat => cat.slug === product.category && !cat.parentId);

  // Find subcategory if product has one
  const subcategory = product.subcategory
    ? categories.find(cat => cat.slug === product.subcategory && cat.parentId)
    : null;

  return (
    <Breadcrumb className={className} aria-label={t('navigation.breadcrumb', 'Breadcrumb navigation')}>
      <BreadcrumbList>
        {/* Home */}
        {includeHome && (
          <>
            <BreadcrumbItem>
              <Link to="/" className="transition-colors hover:text-foreground inline-flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="sr-only">{t('navigation.home', 'Home')}</span>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        {/* Catalog */}
        <BreadcrumbItem>
          <Link to="/catalog" className="transition-colors hover:text-foreground">
            {t('navigation.catalog', 'Catalog')}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {/* Main Category */}
        <BreadcrumbItem>
          <Link to={`/catalog?category=${product.category}`} className="transition-colors hover:text-foreground">
            {mainCategory?.name || product.category}
          </Link>
        </BreadcrumbItem>
        
        {/* Subcategory */}
        {subcategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link to={`/catalog?category=${product.category}&subcategory=${product.subcategory}`} className="transition-colors hover:text-foreground">
                {subcategory.name}
              </Link>
            </BreadcrumbItem>
          </>
        )}
        
        {/* Product Name */}
        {showProductName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[200px] sm:max-w-none">
                {product.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Category-only breadcrumb component
interface CategoryBreadcrumbProps {
  categorySlug: string;
  subcategorySlug?: string;
  includeHome?: boolean;
  className?: string;
}

export function CategoryBreadcrumb({
  categorySlug,
  subcategorySlug,
  includeHome = true,
  className = ''
}: CategoryBreadcrumbProps) {
  const { t } = useTranslation();
  const categories = useAppSelector(selectCategories);

  // Find main category
  const mainCategory = categories.find(cat => cat.slug === categorySlug && !cat.parentId);

  // Find subcategory if provided
  const subcategory = subcategorySlug
    ? categories.find(cat => cat.slug === subcategorySlug && cat.parentId)
    : null;

  return (
    <Breadcrumb className={className} aria-label={t('navigation.breadcrumb', 'Breadcrumb navigation')}>
      <BreadcrumbList>
        {/* Home */}
        {includeHome && (
          <>
            <BreadcrumbItem>
              <Link to="/" className="transition-colors hover:text-foreground inline-flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="sr-only">{t('navigation.home', 'Home')}</span>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        {/* Catalog */}
        <BreadcrumbItem>
          <Link to="/catalog" className="transition-colors hover:text-foreground">
            {t('navigation.catalog', 'Catalog')}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {/* Main Category */}
        <BreadcrumbItem>
          {subcategory ? (
            <Link to={`/catalog?category=${categorySlug}`} className="transition-colors hover:text-foreground">
              {mainCategory?.name || categorySlug}
            </Link>
          ) : (
            <BreadcrumbPage>
              {mainCategory?.name || categorySlug}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        
        {/* Subcategory */}
        {subcategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {subcategory.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

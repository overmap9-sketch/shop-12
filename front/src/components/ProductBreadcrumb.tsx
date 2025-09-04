import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../app/hooks';
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
              <BreadcrumbLink asChild>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">{t('navigation.home', 'Home')}</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        {/* Catalog */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/catalog">
              {t('navigation.catalog', 'Catalog')}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {/* Main Category */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/catalog?category=${product.category}`}>
              {mainCategory?.name || product.category}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {/* Subcategory */}
        {subcategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/catalog?category=${product.category}&subcategory=${product.subcategory}`}>
                  {subcategory.name}
                </Link>
              </BreadcrumbLink>
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
              <BreadcrumbLink asChild>
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">{t('navigation.home', 'Home')}</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        {/* Catalog */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/catalog">
              {t('navigation.catalog', 'Catalog')}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        
        {/* Main Category */}
        <BreadcrumbItem>
          {subcategory ? (
            <BreadcrumbLink asChild>
              <Link to={`/catalog?category=${categorySlug}`}>
                {mainCategory?.name || categorySlug}
              </Link>
            </BreadcrumbLink>
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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectProducts, selectCategories, fetchCategories } from '../../features/catalog/catalogSlice';
import { ProductsAPI } from '../../shared/api';
import { usePermissions } from '../../shared/lib/permissions';
import { NotificationService } from '../../shared/lib/notifications';
import { Product } from '../../entities';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Package,
  Star,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export function AdminProducts() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  
  const [products, setProducts] = useState<Product[]>([]);
  const { has } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'dateAdded'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        if (categories.length === 0) {
          await dispatch(fetchCategories()).unwrap();
        }
        
        // Load products
        const productsData = await ProductsAPI.getProducts({
          page: 1,
          limit: 100
        });
        setProducts(productsData.products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, categories.length]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'price') {
      aValue = a.price;
      bValue = b.price;
    } else if (sortBy === 'dateAdded') {
      aValue = new Date(a.dateAdded);
      bValue = new Date(b.dateAdded);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'destructive' as const };
    } else if (stock <= 5) {
      return { label: 'Low Stock', color: 'secondary' as const };
    } else {
      return { label: 'In Stock', color: 'default' as const };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { label: 'Published', color: 'default' as const };
      case 'draft':
        return { label: 'Draft', color: 'secondary' as const };
      case 'archived':
        return { label: 'Archived', color: 'outline' as const };
      case 'discontinued':
        return { label: 'Discontinued', color: 'destructive' as const };
      default:
        return { label: status, color: 'secondary' as const };
    }
  };

  const getCategoryName = (categorySlug: string) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    return category?.name || categorySlug;
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ProductsAPI.deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleStatusChange = async (productId: string, newStatus: 'draft' | 'published' | 'archived' | 'discontinued') => {
    try {
      await ProductsAPI.updateProduct(productId, { status: newStatus });
      setProducts(products.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Failed to update product status:', error);
      alert('Failed to update product status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('admin.products.title', 'Products')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.products.subtitle', 'Manage your product catalog')}
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button disabled={!has('products.create')} onClick={(e) => { if (!has('products.create')) { e.preventDefault(); NotificationService.permissionDenied(); } }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.products.addProduct', 'Add Product')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('admin.products.searchPlaceholder', 'Search products...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="">{t('admin.products.allCategories', 'All Categories')}</option>
            {categories.filter(cat => !cat.parentId).map(category => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="discontinued">Discontinued</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="dateAdded">{t('admin.products.sortByDate', 'Date Added')}</option>
            <option value="name">{t('admin.products.sortByName', 'Name')}</option>
            <option value="price">{t('admin.products.sortByPrice', 'Price')}</option>
            <option value="stock">{t('admin.products.sortByStock', 'Stock')}</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="desc">{t('admin.products.sortDesc', 'Descending')}</option>
            <option value="asc">{t('admin.products.sortAsc', 'Ascending')}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="text-2xl font-bold text-foreground">
                {products.filter(p => (p.status || 'published') === 'published').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
              <p className="text-2xl font-bold text-foreground">
                ${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold text-foreground">
                {products.length > 0 ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stock Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                
                return (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-foreground">
                            {product.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                          <div className="flex items-center mt-1">
                            {product.isNew && (
                              <Badge variant="secondary" className="mr-1 text-xs">New</Badge>
                            )}
                            {product.isFeatured && (
                              <Badge variant="default" className="mr-1 text-xs">Featured</Badge>
                            )}
                            {product.isOnSale && (
                              <Badge variant="destructive" className="text-xs">Sale</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        ${product.price.toFixed(2)}
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={product.status || 'published'}
                        onChange={(e) => { if (!has('products.update')) { e.preventDefault(); NotificationService.permissionDenied(); return; } handleStatusChange(product.id, e.target.value as any); }}
                        className={`px-2 py-1 rounded-md text-xs font-medium border-0 cursor-pointer ${
                          getStatusBadge(product.status || 'published').color === 'default' ? 'bg-primary text-primary-foreground' :
                          getStatusBadge(product.status || 'published').color === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                          getStatusBadge(product.status || 'published').color === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/product/${product.id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="sm" disabled={!has('products.update')} onClick={(e) => { if (!has('products.update')) { e.preventDefault(); NotificationService.permissionDenied(); } }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => { if (!has('products.delete')) { NotificationService.permissionDenied(); return; } handleDeleteProduct(product.id); }}
                          className="text-destructive hover:text-destructive" disabled={!has('products.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t('admin.products.noProducts', 'No products found')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory
                ? t('admin.products.noProductsFiltered', 'Try adjusting your search or filters')
                : t('admin.products.noProductsEmpty', 'Get started by adding your first product')
              }
            </p>
            <Link to="/admin/products/new">
          <Button disabled={!has('products.create')} onClick={(e) => { if (!has('products.create')) { e.preventDefault(); NotificationService.permissionDenied(); } }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.products.addProduct', 'Add Product')}
          </Button>
        </Link>
          </div>
        )}
      </div>
    </div>
  );
}

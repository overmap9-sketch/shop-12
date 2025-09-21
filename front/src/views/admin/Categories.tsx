import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { selectCategories, fetchCategories } from '../../features/catalog/catalogSlice';
import { Category } from '../../entities';
import { CategoriesAPI } from '../../shared/api';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  ChevronDown,
  Layers,
  Package,
  FolderTree,
  MoreVertical
} from 'lucide-react';

export function AdminCategories() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        await dispatch(fetchCategories()).unwrap();
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length === 0) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [dispatch, categories.length]);

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parentId && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Get all categories flattened for list view
  const getAllCategories = () => {
    const allCats: (Category & { level: number })[] = [];
    
    mainCategories.forEach(mainCat => {
      allCats.push({ ...mainCat, level: 0 });
      const subcats = getSubcategories(mainCat.id);
      subcats.forEach(subcat => {
        allCats.push({ ...subcat, level: 1 });
      });
    });
    
    return allCats;
  };

  const filteredCategories = viewMode === 'tree' 
    ? mainCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSubcategories(cat.id).some(sub => 
          sub.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : getAllCategories().filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      try {
        await CategoriesAPI.deleteCategory(categoryId);
        // Refresh the categories list by dispatching fetch again
        dispatch(fetchCategories());
      } catch (error) {
        console.error('Failed to delete category:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete category. Please try again.';
        alert(message);
      }
    }
  };

  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
  const mainCategoriesCount = mainCategories.length;
  const subcategoriesCount = categories.filter(cat => cat.parentId).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('admin.categories.title', 'Categories')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.categories.subtitle', 'Manage your product categories and hierarchy')}
          </p>
        </div>
        <Link to="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.categories.addCategory', 'Add Category')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Main Categories</p>
              <p className="text-2xl font-bold text-foreground">{mainCategoriesCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <FolderTree className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Subcategories</p>
              <p className="text-2xl font-bold text-foreground">{subcategoriesCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center">
            <Layers className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Avg Products/Category</p>
              <p className="text-2xl font-bold text-foreground">
                {categories.length > 0 ? Math.round(totalProducts / categories.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('admin.categories.searchPlaceholder', 'Search categories...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
              className="rounded-r-none border-r"
            >
              <FolderTree className="h-4 w-4 mr-2" />
              Tree View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <Layers className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Display */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {viewMode === 'tree' ? (
          /* Tree View */
          <div className="p-6">
            {filteredCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <div key={category.id} className="mb-4">
                  {/* Main Category */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center flex-1">
                      {subcategories.length > 0 ? (
                        <button
                          onClick={() => toggleExpanded(category.id)}
                          className="mr-2 p-1 hover:bg-muted rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}
                      
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge variant="secondary">{category.productCount} products</Badge>
                          {subcategories.length > 0 && (
                            <Badge variant="outline">{subcategories.length} subcategories</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link to={`/catalog?category=${category.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/admin/categories/${category.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {isExpanded && subcategories.length > 0 && (
                    <div className="ml-8 mt-3 space-y-2">
                      {subcategories.map((subcat) => (
                        <div key={subcat.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center flex-1">
                            {subcat.image && (
                              <img
                                src={subcat.image}
                                alt={subcat.name}
                                className="w-8 h-8 rounded object-cover mr-3"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{subcat.name}</h4>
                              <p className="text-sm text-muted-foreground">{subcat.description}</p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {subcat.productCount} products
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link to={`/catalog?category=${category.slug}&subcategory=${subcat.slug}`} target="_blank">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/admin/categories/${subcat.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCategory(subcat.id, subcat.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`mr-4 ${category.level > 0 ? 'ml-6' : ''}`}>
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            {category.level > 0 && '└ '}
                            {category.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={category.parentId ? "outline" : "default"}>
                        {category.parentId ? 'Subcategory' : 'Main Category'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {category.productCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {category.sortOrder}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to={category.parentId 
                            ? `/catalog?category=${categories.find(c => c.id === category.parentId)?.slug}&subcategory=${category.slug}`
                            : `/catalog?category=${category.slug}`
                          } 
                          target="_blank"
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t('admin.categories.noCategories', 'No categories found')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? t('admin.categories.noCategoriesFiltered', 'Try adjusting your search')
                : t('admin.categories.noCategoriesEmpty', 'Get started by adding your first category')
              }
            </p>
            <Link to="/admin/categories/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.categories.addCategory', 'Add Category')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

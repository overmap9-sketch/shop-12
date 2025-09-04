import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import { selectCategories } from '../../features/catalog/catalogSlice';
import { Category } from '../../entities';
import { CategoriesAPI } from '../../shared/api';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import {
  Save,
  ArrowLeft,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export function CategoryForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const categories = useAppSelector(selectCategories);
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    sortOrder: 1,
    isActive: true
  });

  useEffect(() => {
    if (isEditing && id) {
      const loadCategory = async () => {
        setLoading(true);
        try {
          const category = await CategoriesAPI.getCategory(id);
          if (category) {
            setFormData({
              name: category.name,
              slug: category.slug,
              description: category.description,
              image: category.image,
              parentId: category.parentId,
              sortOrder: category.sortOrder,
              isActive: category.isActive
            });
          }
        } catch (error) {
          console.error('Failed to load category:', error);
        } finally {
          setLoading(false);
        }
      };
      loadCategory();
    }
  }, [isEditing, id]);

  // Get main categories for parent selection (excluding current category if editing)
  const mainCategories = categories.filter(cat => 
    !cat.parentId && cat.isActive && (!isEditing || cat.id !== id)
  );

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.sortOrder < 1) newErrors.sortOrder = 'Sort order must be at least 1';

    // Check for duplicate slug
    const existingCategory = categories.find(cat => 
      cat.slug === formData.slug && (!isEditing || cat.id !== id)
    );
    if (existingCategory) {
      newErrors.slug = 'This slug is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const categoryData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image,
        parentId: formData.parentId || undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive
      };

      if (isEditing && id) {
        await CategoriesAPI.updateCategory(id, categoryData);
      } else {
        await CategoriesAPI.createCategory(categoryData);
      }

      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to save category:', error);
      setErrors({ submit: 'Failed to save category. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading category..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/categories')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Update category information' : 'Create a new category'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Category name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.slug ? 'border-red-500' : ''}`}
                    placeholder="category-slug"
                  />
                  {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Category description"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Hierarchy */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Category Hierarchy</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Parent Category</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => handleInputChange('parentId', e.target.value || undefined)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Main Category (No Parent)</option>
                  {mainCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to create a main category, or select a parent to create a subcategory
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort Order *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.sortOrder ? 'border-red-500' : ''}`}
                  placeholder="1"
                />
                {errors.sortOrder && <p className="text-red-500 text-xs mt-1">{errors.sortOrder}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first in category listings
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <div>
                  <span className="font-medium">Active</span>
                  <p className="text-sm text-muted-foreground">
                    Active categories are visible to customers
                  </p>
                </div>
              </label>

              {!formData.isActive && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Category will be hidden</p>
                      <p>Inactive categories won't be visible to customers but will remain in the admin panel.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/categories')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              
              <div className="border rounded-lg overflow-hidden max-w-sm">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                  {formData.parentId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Subcategory of: {mainCategories.find(cat => cat.id === formData.parentId)?.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

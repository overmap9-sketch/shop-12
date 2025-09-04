import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import { selectCategories } from '../../features/catalog/catalogSlice';
import { Product } from '../../entities';
import { ProductsAPI, ImageUploadAPI } from '../../shared/api';
import { ImageUploader, ImageItem } from '../../components/ui/ImageUploader';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Badge } from '../../components/ui/badge';
import {
  Save,
  ArrowLeft,
  Plus,
  AlertTriangle,
  X
} from 'lucide-react';

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: ImageItem[];
  category: string;
  subcategory?: string;
  tags: string[];
  stock: number;
  sku: string;
  brand: string;
  features: string[];
  specifications: Record<string, string>;
  status: 'draft' | 'published' | 'archived' | 'discontinued';
  isNew: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
}

export function ProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const categories = useAppSelector(selectCategories);
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');
  const [currentFeature, setCurrentFeature] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    slug: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    currency: 'USD',
    images: [],
    category: '',
    subcategory: '',
    tags: [],
    stock: 0,
    sku: '',
    brand: '',
    features: [],
    specifications: {},
    status: 'draft',
    isNew: false,
    isFeatured: false,
    isOnSale: false
  });

  useEffect(() => {
    if (isEditing && id) {
      const loadProduct = async () => {
        setLoading(true);
        try {
          const product = await ProductsAPI.getProduct(id);
          if (product) {
            // Convert existing image URLs to ImageItem format
            const imageItems: ImageItem[] = product.images.map((url, index) => ({
              id: `existing-${index}-${Date.now()}`,
              url,
              isMain: index === 0
            }));

            setFormData({
              title: product.title,
              slug: product.slug,
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice,
              currency: product.currency,
              images: imageItems,
              category: product.category,
              subcategory: product.subcategory,
              tags: product.tags,
              stock: product.stock,
              sku: product.sku,
              brand: product.brand || '',
              features: product.features,
              specifications: product.specifications,
              status: product.status || 'published',
              isNew: product.isNew,
              isFeatured: product.isFeatured,
              isOnSale: product.isOnSale
            });
          }
        } catch (error) {
          console.error('Failed to load product:', error);
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [isEditing, id]);

  const mainCategories = categories.filter(cat => !cat.parentId);
  const subcategories = formData.category 
    ? categories.filter(cat => cat.parentId && categories.find(parent => parent.slug === formData.category)?.id === cat.parentId)
    : [];

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
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

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      // Convert ImageItem array to string array for API
      const imageUrls = formData.images.map(img => img.url);

      const productData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice,
        currency: formData.currency,
        images: imageUrls,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        stock: formData.stock,
        sku: formData.sku,
        brand: formData.brand,
        features: formData.features,
        specifications: formData.specifications,
        status: formData.status,
        isNew: formData.isNew,
        isFeatured: formData.isFeatured,
        isOnSale: formData.isOnSale,
        rating: 0,
        reviewCount: 0,
        soldCount: 0
      };

      if (isEditing && id) {
        await ProductsAPI.updateProduct(id, productData);
      } else {
        await ProductsAPI.createProduct(productData);
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      return await ImageUploadAPI.uploadImage(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addFeature = () => {
    if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading product..." />
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
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Update product information' : 'Create a new product'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Product title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.slug ? 'border-red-500' : ''}`}
                    placeholder="product-slug"
                  />
                  {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Product description"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.brand ? 'border-red-500' : ''}`}
                    placeholder="Brand name"
                  />
                  {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.sku ? 'border-red-500' : ''}`}
                    placeholder="Product SKU"
                  />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice || ''}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.stock ? 'border-red-500' : ''}`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Product Images</h2>

              <ImageUploader
                images={formData.images}
                onChange={(images) => {
                  if (typeof images === 'function') {
                    setFormData(prev => ({
                      ...prev,
                      images: images(prev.images)
                    }));
                  } else {
                    handleInputChange('images', images);
                  }
                }}
                onUpload={handleImageUpload}
                maxImages={10}
                maxFileSize={5}
                disabled={saving}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Main Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value);
                      handleInputChange('subcategory', ''); // Reset subcategory
                    }}
                    className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select category</option>
                    {mainCategories.map(category => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                {subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Subcategory</label>
                    <select
                      value={formData.subcategory || ''}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select subcategory</option>
                      {subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.slug}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Product Status */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Publication Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.status === 'draft' && 'Product is hidden from customers and can be edited'}
                    {formData.status === 'published' && 'Product is visible to customers and available for purchase'}
                    {formData.status === 'archived' && 'Product is hidden but data is preserved'}
                    {formData.status === 'discontinued' && 'Product is no longer available but visible for reference'}
                  </p>
                </div>

                <hr className="border-border" />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Additional Flags</h3>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => handleInputChange('isNew', e.target.checked)}
                      className="mr-2"
                    />
                    New Product
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="mr-2"
                    />
                    Featured Product
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                      className="mr-2"
                    />
                    On Sale
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tags */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Features</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Add feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="space-y-2">
                  {formData.features.map(feature => (
                    <div key={feature} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Specifications</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="px-3 py-2 border rounded-md"
                placeholder="Specification name"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Specification value"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                />
                <Button type="button" onClick={addSpecification}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {Object.keys(formData.specifications).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

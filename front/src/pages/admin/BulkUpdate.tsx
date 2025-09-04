import React, { useEffect, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCategories, fetchCategories } from '../../features/catalog/catalogSlice';
import { ProductsAPI } from '../../shared/api';
import { Save, SlidersHorizontal } from 'lucide-react';
import { usePermissions } from '../../shared/lib/permissions';
import { NotificationService } from '../../shared/lib/notifications';

export function AdminBulkUpdate() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const [filters, setFilters] = useState<{ category?: string; subcategory?: string; status?: string; isOnSale?: boolean; inStock?: boolean }>({});
  const { has } = usePermissions();
  const [price, setPrice] = useState<{ mode: 'none' | 'set' | 'increase_percent' | 'decrease_percent' | 'increase_amount' | 'decrease_amount'; value: number }>({ mode: 'none', value: 0 });
  const [stock, setStock] = useState<{ mode: 'none' | 'set' | 'increase' | 'decrease'; value: number }>({ mode: 'none', value: 0 });
  const [flags, setFlags] = useState<{ isOnSale?: '' | 'true' | 'false'; isFeatured?: '' | 'true' | 'false'; isNew?: '' | 'true' | 'false' }>({});
  const [setOriginal, setSetOriginal] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => { if (categories.length === 0) dispatch(fetchCategories()); }, [dispatch, categories.length]);

  const apply = async () => {
    const f: any = {};
    if (filters.category) f.category = filters.category;
    if (filters.subcategory) f.subcategory = filters.subcategory;
    if (filters.status) f.status = filters.status as any;
    if (filters.isOnSale !== undefined) f.isOnSale = filters.isOnSale;
    if (filters.inStock !== undefined) f.inStock = filters.inStock;

    const flagPayload: any = {};
    if (flags.isOnSale) flagPayload.isOnSale = flags.isOnSale === 'true';
    if (flags.isFeatured) flagPayload.isFeatured = flags.isFeatured === 'true';
    if (flags.isNew) flagPayload.isNew = flags.isNew === 'true';

    const pricePayload = price.mode === 'none' ? undefined : { mode: price.mode as any, value: price.value };
    const stockPayload = stock.mode === 'none' ? undefined : { mode: stock.mode as any, value: stock.value };

    if (!has('products.bulkUpdate')) { NotificationService.permissionDenied(); return; }
    const updated = await ProductsAPI.bulkUpdate({ filters: f, price: pricePayload as any, stock: stockPayload as any, flags: Object.keys(flagPayload).length ? flagPayload : undefined, setOriginalPriceFromPrice: setOriginal });
    setResult(updated);
  };

  const mainCategories = categories.filter(c => !c.parentId);
  const subcats = filters.category ? categories.filter(c => c.parentId && categories.find(p => p.slug === filters.category)?.id === c.parentId) : [];

  return (
    <div className="space-y-6">
      {!has('products.bulkUpdate') && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">You do not have permission to use Bulk Update.</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bulk Update</h1>
          <p className="text-muted-foreground mt-1">Apply batch changes to products</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center"><SlidersHorizontal className="h-5 w-5 mr-2"/>Scope</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select className="w-full px-3 py-2 border rounded-md" value={filters.category || ''} onChange={e => setFilters({ ...filters, category: e.target.value || undefined, subcategory: undefined })}>
              <option value="">All</option>
              {mainCategories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subcategory</label>
            <select className="w-full px-3 py-2 border rounded-md" value={filters.subcategory || ''} onChange={e => setFilters({ ...filters, subcategory: e.target.value || undefined })}>
              <option value="">All</option>
              {subcats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select className="w-full px-3 py-2 border rounded-md" value={filters.status || ''} onChange={e => setFilters({ ...filters, status: e.target.value || undefined })}>
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">On Sale</label>
            <select className="w-full px-3 py-2 border rounded-md" value={filters.isOnSale === undefined ? '' : filters.isOnSale ? 'true' : 'false'} onChange={e => setFilters({ ...filters, isOnSale: e.target.value === '' ? undefined : e.target.value === 'true' })}>
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">In Stock</label>
            <select className="w-full px-3 py-2 border rounded-md" value={filters.inStock === undefined ? '' : filters.inStock ? 'true' : 'false'} onChange={e => setFilters({ ...filters, inStock: e.target.value === '' ? undefined : e.target.value === 'true' })}>
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <h2 className="text-xl font-semibold">Price</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
            <select className="w-full px-3 py-2 border rounded-md" value={price.mode} onChange={e => setPrice({ ...price, mode: e.target.value as any })}>
              <option value="none">Do not change</option>
              <option value="set">Set Value</option>
              <option value="increase_percent">Increase by %</option>
              <option value="decrease_percent">Decrease by %</option>
              <option value="increase_amount">Increase by amount</option>
              <option value="decrease_amount">Decrease by amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" value={price.value} onChange={e => setPrice({ ...price, value: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center"><input type="checkbox" className="mr-2" checked={setOriginal} onChange={e => setSetOriginal(e.target.checked)} />Set originalPrice from current price before change</label>
          </div>
        </div>

        <h2 className="text-xl font-semibold">Stock</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
            <select className="w-full px-3 py-2 border rounded-md" value={stock.mode} onChange={e => setStock({ ...stock, mode: e.target.value as any })}>
              <option value="none">Do not change</option>
              <option value="set">Set</option>
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={stock.value} onChange={e => setStock({ ...stock, value: parseInt(e.target.value) || 0 })} />
          </div>
        </div>

        <h2 className="text-xl font-semibold">Flags</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">On Sale</label>
            <select className="w-full px-3 py-2 border rounded-md" value={flags.isOnSale || ''} onChange={e => setFlags({ ...flags, isOnSale: e.target.value as any })}>
              <option value="">Do not change</option>
              <option value="true">Set: Yes</option>
              <option value="false">Set: No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Featured</label>
            <select className="w-full px-3 py-2 border rounded-md" value={flags.isFeatured || ''} onChange={e => setFlags({ ...flags, isFeatured: e.target.value as any })}>
              <option value="">Do not change</option>
              <option value="true">Set: Yes</option>
              <option value="false">Set: No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New</label>
            <select className="w-full px-3 py-2 border rounded-md" value={flags.isNew || ''} onChange={e => setFlags({ ...flags, isNew: e.target.value as any })}>
              <option value="">Do not change</option>
              <option value="true">Set: Yes</option>
              <option value="false">Set: No</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <Button onClick={apply} disabled={!has('products.bulkUpdate')}><Save className="h-4 w-4 mr-2"/>Apply Changes</Button>
          {result !== null && <div className="text-sm text-muted-foreground self-center">Updated {result} products.</div>}
        </div>
      </div>
    </div>
  );
}

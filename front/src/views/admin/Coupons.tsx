import React, { useEffect, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import { CouponsAPI, type Coupon } from '../../shared/api';
import { Plus, Save, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { usePermissions } from '../../shared/lib/permissions';
import { NotificationService } from '../../shared/lib/notifications';

export function AdminCoupons() {
  const [list, setList] = useState<Coupon[]>([]);
  const { has } = usePermissions();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({ code: '', type: 'percentage', value: 10, isActive: true });

  useEffect(() => { setList(CouponsAPI.list()); }, []);

  const startNew = () => { if (!has('coupons.create')) { NotificationService.permissionDenied(); return; } setEditing(null); setForm({ code: '', type: 'percentage', value: 10, isActive: true }); };

  const startEdit = (c: Coupon) => { setEditing(c); setForm({ ...c }); };

  const save = () => {
    if (!form.code || !form.type || form.value === undefined) return;
    if (editing) { if (!has('coupons.update')) { NotificationService.permissionDenied(); return; }
      const updated = CouponsAPI.update(editing.id, form as any);
      if (updated) {
        setList(CouponsAPI.list());
        setEditing(null);
      }
    } else { if (!has('coupons.create')) { NotificationService.permissionDenied(); return; }
      CouponsAPI.create({ ...(form as any) });
      setList(CouponsAPI.list());
    }
  };

  const remove = (id: string) => { if (!has('coupons.delete')) { NotificationService.permissionDenied(); return; } if (window.confirm('Delete coupon?')) { CouponsAPI.delete(id); setList(CouponsAPI.list()); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-1">Create and manage discount codes</p>
        </div>
        <Button onClick={startNew} disabled={!has('coupons.create')}><Plus className="h-4 w-4 mr-2"/>New Coupon</Button>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Code</label>
            <input className="w-full px-3 py-2 border rounded-md" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select className="w-full px-3 py-2 border rounded-md" value={form.type as any} onChange={e => setForm({ ...form, type: e.target.value as any })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={form.value as any} onChange={e => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Min Subtotal</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={(form.minSubtotal as any) || ''} onChange={e => setForm({ ...form, minSubtotal: e.target.value ? parseFloat(e.target.value) : undefined })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Discount</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={(form.maxDiscount as any) || ''} onChange={e => setForm({ ...form, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Expires At</label>
            <input type="date" className="w-full px-3 py-2 border rounded-md" value={form.expiresAt ? form.expiresAt.slice(0,10) : ''} onChange={e => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Usage Limit</label>
            <input type="number" className="w-full px-3 py-2 border rounded-md" value={(form.usageLimit as any) || ''} onChange={e => setForm({ ...form, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })} />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center"><input type="checkbox" className="mr-2" checked={!!form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />Active</label>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center"><input type="checkbox" className="mr-2" checked={!!form.freeShipping} onChange={e => setForm({ ...form, freeShipping: e.target.checked })} />Free Shipping</label>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={save} disabled={editing ? !has('coupons.update') : !has('coupons.create')}><Save className="h-4 w-4 mr-2"/>Save</Button>
          {editing && (
            <Button variant="outline" onClick={startNew}>Cancel</Button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map(c => (
                <tr key={c.id} className="hover:bg-muted/50">
                  <td className="px-6 py-3 font-medium">{c.code}</td>
                  <td className="px-6 py-3">{c.type}</td>
                  <td className="px-6 py-3">{c.type === 'percentage' ? `${c.value}%` : `$${c.value.toFixed(2)}`}</td>
                  <td className="px-6 py-3">{c.isActive ? <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/>Active</Badge> : <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3"/>Inactive</Badge>}</td>
                  <td className="px-6 py-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(c)} disabled={!has('coupons.update')}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(c.id)} disabled={!has('coupons.delete')}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

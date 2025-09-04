import React, { useEffect, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { SettingsAPI, ShippingSettings, ShippingZone, ShippingMethod, AdminSettings } from '../../shared/api';
import { Save, Truck, Plus, Trash2 } from 'lucide-react';

export function AdminShipping() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [form, setForm] = useState<ShippingSettings>({ zones: [], handlingFee: 0, defaultMethodId: undefined });

  useEffect(() => {
    const s = SettingsAPI.getSettings();
    setSettings(s);
    setForm(s.shipping);
  }, []);

  const addZone = () => {
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    setForm(prev => ({ ...prev, zones: [...prev.zones, { id, name: 'New Zone', countries: [], methods: [] }] }));
  };

  const removeZone = (id: string) => {
    setForm(prev => ({ ...prev, zones: prev.zones.filter(z => z.id !== id) }));
  };

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    setForm(prev => ({ ...prev, zones: prev.zones.map(z => (z.id === id ? { ...z, ...patch } : z)) }));
  };

  const addMethod = (zoneId: string) => {
    const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    const method: ShippingMethod = { id, name: 'New Method', rate: 0, enabled: true };
    setForm(prev => ({ ...prev, zones: prev.zones.map(z => z.id === zoneId ? { ...z, methods: [...z.methods, method] } : z) }));
  };

  const removeMethod = (zoneId: string, methodId: string) => {
    setForm(prev => ({ ...prev, zones: prev.zones.map(z => z.id === zoneId ? { ...z, methods: z.methods.filter(m => m.id !== methodId) } : z) }));
  };

  const updateMethod = (zoneId: string, methodId: string, patch: Partial<ShippingMethod>) => {
    setForm(prev => ({ ...prev, zones: prev.zones.map(z => z.id === zoneId ? { ...z, methods: z.methods.map(m => m.id === methodId ? { ...m, ...patch } : m) } : z) }));
  };

  const handleSave = () => {
    if (!settings) return;
    setSaving(true);
    try {
      const next: AdminSettings = { ...settings, shipping: form };
      SettingsAPI.saveSettings(next);
      setSettings(next);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <div className="flex items-center justify-center min-h-[300px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipping</h1>
          <p className="text-muted-foreground mt-1">Manage shipping zones, methods, and rates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { const s = SettingsAPI.getSettings(); setSettings(s); setForm(s.shipping); }}>Reset</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (<><Save className="h-4 w-4 mr-2"/>Save</>)}</Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center"><Truck className="h-5 w-5 mr-2"/>Shipping Zones</h2>
          <Button size="sm" onClick={addZone}><Plus className="h-4 w-4 mr-2"/>Add Zone</Button>
        </div>

        <div className="space-y-6">
          {form.zones.length === 0 && (
            <div className="text-sm text-muted-foreground">No zones yet. Click "Add Zone" to create one.</div>
          )}
          {form.zones.map((z) => (
            <div key={z.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Zone Name</label>
                      <input className="w-full px-3 py-2 border rounded-md" value={z.name} onChange={e => updateZone(z.id, { name: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Countries (comma separated ISO codes)</label>
                      <input className="w-full px-3 py-2 border rounded-md" value={z.countries.join(', ')} onChange={e => updateZone(z.id, { countries: e.target.value.split(',').map(c => c.trim()).filter(Boolean) })} />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" className="text-destructive" onClick={() => removeZone(z.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Methods</h4>
                  <Button size="sm" variant="outline" onClick={() => addMethod(z.id)}><Plus className="h-4 w-4 mr-2"/>Add Method</Button>
                </div>
                <div className="space-y-3">
                  {z.methods.length === 0 && (<div className="text-xs text-muted-foreground">No methods yet.</div>)}
                  {z.methods.map(m => (
                    <div key={m.id} className="border rounded-md p-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Name</label>
                          <input className="w-full px-3 py-2 border rounded-md" value={m.name} onChange={e => updateMethod(z.id, m.id, { name: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Rate ($)</label>
                          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" value={m.rate} onChange={e => updateMethod(z.id, m.id, { rate: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Free Threshold ($)</label>
                          <input type="number" step="0.01" className="w-full px-3 py-2 border rounded-md" value={m.freeShippingThreshold || ''} onChange={e => updateMethod(z.id, m.id, { freeShippingThreshold: e.target.value ? parseFloat(e.target.value) : undefined })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">ETA (min-max days)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" className="w-full px-3 py-2 border rounded-md" value={m.minDeliveryDays || ''} onChange={e => updateMethod(z.id, m.id, { minDeliveryDays: e.target.value ? parseInt(e.target.value) : undefined })} />
                            <input type="number" className="w-full px-3 py-2 border rounded-md" value={m.maxDeliveryDays || ''} onChange={e => updateMethod(z.id, m.id, { maxDeliveryDays: e.target.value ? parseInt(e.target.value) : undefined })} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center text-sm"><input type="checkbox" className="mr-2" checked={m.enabled} onChange={e => updateMethod(z.id, m.id, { enabled: e.target.checked })} />Enabled</label>
                          <Button variant="ghost" className="text-destructive" onClick={() => removeMethod(z.id, m.id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

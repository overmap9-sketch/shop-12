import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { ImageUploader, ImageItem } from '../../components/ui/ImageUploader';
import { SettingsAPI } from '../../shared/api';
import type { BannerSettings, AdminSettings as AdminSettingsModel } from '../../shared/api';
import { usePermissions } from '../../shared/lib/permissions';
import { NotificationService } from '../../shared/lib/notifications';

interface BannerForm extends BannerSettings {
  desktopImages: ImageItem[];
  mobileImages: ImageItem[];
}

function toImageItems(url?: string): ImageItem[] {
  return url ? [{ id: `${Date.now()}`, url, isMain: true }] : [];
}

function firstUrl(items: ImageItem[]): string | undefined {
  return items[0]?.url;
}

export function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const { has } = usePermissions();
  const [settings, setSettings] = useState<AdminSettingsModel | null>(null);
  const [banners, setBanners] = useState<BannerForm[]>([]);

  useEffect(() => {
    const s = SettingsAPI.getSettings();
    setSettings(s);
    setBanners(
      s.banners.map(b => ({
        ...b,
        desktopImages: toImageItems(b.imageDesktop),
        mobileImages: toImageItems(b.imageMobile),
      }))
    );
  }, []);

  const addBanner = () => {
    if (!has('settings.update')) { NotificationService.permissionDenied(); return; }
    const nowId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    setBanners(prev => [
      ...prev,
      {
        id: nowId,
        title: 'New Banner',
        subtitle: '',
        ctaText: '',
        ctaUrl: '',
        active: false,
        placement: 'home',
        backgroundColor: '#111827',
        imageDesktop: undefined,
        imageMobile: undefined,
        desktopImages: [],
        mobileImages: [],
      },
    ]);
  };

  const removeBanner = (id: string) => {
    if (!has('settings.update')) { NotificationService.permissionDenied(); return; }
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const updateBanner = (id: string, patch: Partial<BannerForm>) => {
    if (!has('settings.update')) { NotificationService.permissionDenied(); return; }
    setBanners(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
  };

  const handleSave = async () => {
    if (!has('settings.update')) { NotificationService.permissionDenied(); return; }
    if (!settings) return;
    setSaving(true);
    try {
      const next: AdminSettingsModel = {
        ...settings,
        banners: banners.map(b => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          ctaText: b.ctaText,
          ctaUrl: b.ctaUrl,
          active: b.active,
          placement: b.placement,
          backgroundColor: b.backgroundColor,
          imageDesktop: firstUrl(b.desktopImages),
          imageMobile: firstUrl(b.mobileImages),
        })),
      };
      SettingsAPI.saveSettings(next);
      setSettings(next);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage site-wide settings and banners</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { const s = SettingsAPI.getSettings(); setSettings(s); setBanners(s.banners.map(b => ({...b, desktopImages: toImageItems(b.imageDesktop), mobileImages: toImageItems(b.imageMobile)}))); }}>Reset</Button>
          <Button onClick={handleSave} disabled={saving || !has('settings.update')}>{saving ? 'Saving...' : (<><Save className="h-4 w-4 mr-2" />Save</>)}</Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center"><ImageIcon className="h-5 w-5 mr-2"/>Banner Settings</h2>
          <Button size="sm" onClick={addBanner} disabled={!has('settings.update')}><Plus className="h-4 w-4 mr-2"/>Add Banner</Button>
        </div>

        <div className="space-y-6">
          {banners.length === 0 && (
            <div className="text-sm text-muted-foreground">No banners yet. Click "Add Banner" to create one.</div>
          )}
          {banners.map((b, idx) => (
            <div key={b.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">Banner #{idx + 1}</h3>
                  <p className="text-xs text-muted-foreground">Placement: {b.placement}</p>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm mr-2">
                    <input type="checkbox" className="mr-2" checked={b.active} onChange={e => updateBanner(b.id, { active: e.target.checked })} />
                    Active
                  </label>
                  <Button variant="ghost" className="text-destructive" onClick={() => removeBanner(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input className="w-full px-3 py-2 border rounded-md" value={b.title} onChange={e => updateBanner(b.id, { title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input className="w-full px-3 py-2 border rounded-md" value={b.subtitle || ''} onChange={e => updateBanner(b.id, { subtitle: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CTA Text</label>
                  <input className="w-full px-3 py-2 border rounded-md" value={b.ctaText || ''} onChange={e => updateBanner(b.id, { ctaText: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CTA URL</label>
                  <div className="flex gap-2">
                    <input className="flex-1 px-3 py-2 border rounded-md" value={b.ctaUrl || ''} onChange={e => updateBanner(b.id, { ctaUrl: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Placement</label>
                  <select className="w-full px-3 py-2 border rounded-md" value={b.placement} onChange={e => updateBanner(b.id, { placement: e.target.value as any })}>
                    <option value="home">Home</option>
                    <option value="catalog">Catalog</option>
                    <option value="all">All Pages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <input type="color" className="w-16 h-10 p-0 border rounded" value={b.backgroundColor || '#111827'} onChange={e => updateBanner(b.id, { backgroundColor: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium mb-2">Desktop Image</h4>
                  <ImageUploader
                    images={b.desktopImages}
                    onChange={(imgs: any) => {
                      if (typeof imgs === 'function') {
                        updateBanner(b.id, { desktopImages: imgs(b.desktopImages) });
                      } else {
                        updateBanner(b.id, { desktopImages: imgs });
                      }
                    }}
                    onUpload={SettingsAPI.uploadImage}
                    maxImages={1}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Mobile Image</h4>
                  <ImageUploader
                    images={b.mobileImages}
                    onChange={(imgs: any) => {
                      if (typeof imgs === 'function') {
                        updateBanner(b.id, { mobileImages: imgs(b.mobileImages) });
                      } else {
                        updateBanner(b.id, { mobileImages: imgs });
                      }
                    }}
                    onUpload={SettingsAPI.uploadImage}
                    maxImages={1}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { SettingsAPI, ContactSettings, AdminSettings } from '../../shared/api';
import { Save, Mail, MapPin } from 'lucide-react';

export function AdminContacts() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [form, setForm] = useState<ContactSettings>({
    supportEmail: '',
    supportPhone: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    showContactForm: true,
    autoReplyEnabled: false,
    autoReplySubject: '',
    autoReplyMessage: '',
    social: { facebook: '', instagram: '', twitter: '', linkedin: '' },
  });

  useEffect(() => {
    const s = SettingsAPI.getSettings();
    setSettings(s);
    setForm({
      ...s.contacts,
      address: {
        street: s.contacts.address?.street || '',
        city: s.contacts.address?.city || '',
        state: s.contacts.address?.state || '',
        zip: s.contacts.address?.zip || '',
        country: s.contacts.address?.country || '',
      },
      social: {
        facebook: s.contacts.social?.facebook || '',
        instagram: s.contacts.social?.instagram || '',
        twitter: s.contacts.social?.twitter || '',
        linkedin: s.contacts.social?.linkedin || '',
      },
    });
  }, []);

  const setField = (field: keyof ContactSettings, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!settings) return;
    setSaving(true);
    try {
      const cleaned: ContactSettings = {
        ...form,
        supportPhone: form.supportPhone || undefined,
        autoReplySubject: form.autoReplySubject || undefined,
        autoReplyMessage: form.autoReplyMessage || undefined,
        address: {
          street: form.address?.street || undefined,
          city: form.address?.city || undefined,
          state: form.address?.state || undefined,
          zip: form.address?.zip || undefined,
          country: form.address?.country || undefined,
        },
        social: {
          facebook: form.social?.facebook || undefined,
          instagram: form.social?.instagram || undefined,
          twitter: form.social?.twitter || undefined,
          linkedin: form.social?.linkedin || undefined,
        },
      };
      const next: AdminSettings = { ...settings, contacts: cleaned };
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
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage contact information and support settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { const s = SettingsAPI.getSettings(); setSettings(s); setForm({ ...s.contacts, address: { street: s.contacts.address?.street || '', city: s.contacts.address?.city || '', state: s.contacts.address?.state || '', zip: s.contacts.address?.zip || '', country: s.contacts.address?.country || '' }, social: { facebook: s.contacts.social?.facebook || '', instagram: s.contacts.social?.instagram || '', twitter: s.contacts.social?.twitter || '', linkedin: s.contacts.social?.linkedin || '' } }); }}>Reset</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (<><Save className="h-4 w-4 mr-2"/>Save</>)}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><Mail className="h-5 w-5 mr-2"/>Support</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Support Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded-md" value={form.supportEmail} onChange={e => setField('supportEmail', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Support Phone</label>
            <input type="tel" className="w-full px-3 py-2 border rounded-md" value={form.supportPhone || ''} onChange={e => setField('supportPhone', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Show Contact Form</label>
              <label className="inline-flex items-center"><input type="checkbox" className="mr-2" checked={form.showContactForm} onChange={e => setField('showContactForm', e.target.checked)} />Enable</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto Reply</label>
              <label className="inline-flex items-center"><input type="checkbox" className="mr-2" checked={form.autoReplyEnabled} onChange={e => setField('autoReplyEnabled', e.target.checked)} />Enable</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auto Reply Subject</label>
            <input className="w-full px-3 py-2 border rounded-md" value={form.autoReplySubject || ''} onChange={e => setField('autoReplySubject', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auto Reply Message</label>
            <textarea rows={4} className="w-full px-3 py-2 border rounded-md" value={form.autoReplyMessage || ''} onChange={e => setField('autoReplyMessage', e.target.value)} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><MapPin className="h-5 w-5 mr-2"/>Address</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Street</label>
            <input className="w-full px-3 py-2 border rounded-md" value={form.address?.street || ''} onChange={e => setField('address', { ...form.address, street: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.address?.city || ''} onChange={e => setField('address', { ...form.address, city: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.address?.state || ''} onChange={e => setField('address', { ...form.address, state: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ZIP</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.address?.zip || ''} onChange={e => setField('address', { ...form.address, zip: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.address?.country || ''} onChange={e => setField('address', { ...form.address, country: e.target.value })} />
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-6">Social</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.social?.facebook || ''} onChange={e => setField('social', { ...form.social, facebook: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.social?.instagram || ''} onChange={e => setField('social', { ...form.social, instagram: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.social?.twitter || ''} onChange={e => setField('social', { ...form.social, twitter: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <input className="w-full px-3 py-2 border rounded-md" value={form.social?.linkedin || ''} onChange={e => setField('social', { ...form.social, linkedin: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

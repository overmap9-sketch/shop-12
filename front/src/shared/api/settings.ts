import { Storage, STORAGE_KEYS } from '../lib/storage';
import { ImageUploadAPI } from './images';
import { Storage, STORAGE_KEYS } from '../lib/storage';
import { AuditAPI } from './audit';

export type BannerPlacement = 'home' | 'catalog' | 'all';

export interface BannerSettings {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  active: boolean;
  placement: BannerPlacement;
  backgroundColor?: string;
  imageDesktop?: string;
  imageMobile?: string;
}

export interface ContactSettings {
  supportEmail: string;
  supportPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  showContactForm: boolean;
  autoReplyEnabled: boolean;
  autoReplySubject?: string;
  autoReplyMessage?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  rate: number; // flat rate
  freeShippingThreshold?: number;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
  enabled: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[]; // ISO codes
  methods: ShippingMethod[];
}

export interface ShippingSettings {
  zones: ShippingZone[];
  handlingFee?: number;
  defaultMethodId?: string;
}

export interface AdminSettings {
  banners: BannerSettings[];
  contacts: ContactSettings;
  shipping: ShippingSettings;
}

const generateId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const defaultSettings: AdminSettings = {
  banners: [
    {
      id: generateId(),
      title: 'Welcome to our store',
      subtitle: 'Discover great deals every day',
      ctaText: 'Shop Now',
      ctaUrl: '/catalog',
      active: true,
      placement: 'home',
      backgroundColor: '#111827',
      imageDesktop: undefined,
      imageMobile: undefined,
    },
  ],
  contacts: {
    supportEmail: 'support@example.com',
    supportPhone: '+1 234 567 8900',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    showContactForm: true,
    autoReplyEnabled: false,
    autoReplySubject: 'We received your message',
    autoReplyMessage: 'Thanks for contacting us. Our team will reply shortly.',
    social: {},
  },
  shipping: {
    zones: [
      {
        id: generateId(),
        name: 'Default',
        countries: ['US'],
        methods: [
          { id: generateId(), name: 'Standard', rate: 9.99, minDeliveryDays: 3, maxDeliveryDays: 7, enabled: true },
          { id: generateId(), name: 'Express', rate: 19.99, minDeliveryDays: 1, maxDeliveryDays: 3, enabled: true },
        ],
      },
    ],
    handlingFee: 0,
    defaultMethodId: undefined,
  },
};

export class SettingsAPI {
  static getSettings(): AdminSettings {
    const existing = Storage.get<AdminSettings>(STORAGE_KEYS.SETTINGS, null);
    if (existing) return existing;
    Storage.set<AdminSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
    return defaultSettings;
  }

  static saveSettings(settings: AdminSettings): void {
    const before = Storage.get<AdminSettings>(STORAGE_KEYS.SETTINGS, null);
    Storage.set<AdminSettings>(STORAGE_KEYS.SETTINGS, settings);
    AuditAPI.record({ action: before ? 'update' : 'create', entity: 'settings', entityId: 'admin_settings', before, after: settings });
  }

  static addBanner(partial: Partial<BannerSettings>): BannerSettings {
    const settings = this.getSettings();
    const banner: BannerSettings = {
      id: generateId(),
      title: partial.title || 'New Banner',
      subtitle: partial.subtitle,
      ctaText: partial.ctaText,
      ctaUrl: partial.ctaUrl,
      active: partial.active ?? false,
      placement: partial.placement || 'home',
      backgroundColor: partial.backgroundColor,
      imageDesktop: partial.imageDesktop,
      imageMobile: partial.imageMobile,
    };
    const next = { ...settings, banners: [...settings.banners, banner] };
    this.saveSettings(next);
    return banner;
  }

  static updateBanner(id: string, update: Partial<BannerSettings>): BannerSettings | null {
    const settings = this.getSettings();
    const idx = settings.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    const updated = { ...settings.banners[idx], ...update };
    const next = { ...settings, banners: settings.banners.map(b => (b.id === id ? updated : b)) };
    this.saveSettings(next);
    return updated;
  }

  static deleteBanner(id: string): void {
    const settings = this.getSettings();
    const next = { ...settings, banners: settings.banners.filter(b => b.id !== id) };
    this.saveSettings(next);
  }

  static setContacts(contacts: ContactSettings): void {
    const settings = this.getSettings();
    this.saveSettings({ ...settings, contacts });
  }

  static setShipping(shipping: ShippingSettings): void {
    const settings = this.getSettings();
    this.saveSettings({ ...settings, shipping });
  }

  static async uploadImage(file: File): Promise<string> {
    return ImageUploadAPI.uploadImage(file);
  }
}

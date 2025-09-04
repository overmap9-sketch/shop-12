import { Product, Category } from '../../entities';
import { Storage, STORAGE_KEYS } from './storage';

// Fixed paint-related image pool (royalty-free)
const PAINT_IMAGES = [
  'https://images.pexels.com/photos/7217966/pexels-photo-7217966.jpeg', // interior prep
  'https://images.pexels.com/photos/2293822/pexels-photo-2293822.jpeg', // tray and roller
  'https://images.pexels.com/photos/221027/pexels-photo-221027.jpeg',   // exterior painting wood
  'https://images.pexels.com/photos/5642113/pexels-photo-5642113.jpeg', // brushes and cans
  'https://images.pexels.com/photos/5583096/pexels-photo-5583096.jpeg', // rollers and ladder
  'https://images.pexels.com/photos/7493875/pexels-photo-7493875.jpeg', // paint sprayer
  'https://images.pexels.com/photos/2768398/pexels-photo-2768398.jpeg', // masonry wall texture
  'https://images.pexels.com/photos/7217957/pexels-photo-7217957.jpeg', // chalk paint furniture scene
];

// Helper to build fixed paint-related images deterministically from seed
const getProductImages = (seed: string, count: number = 3): string[] => {
  const list = PAINT_IMAGES;
  const hash = Array.from(seed).reduce((h, ch) => ((h * 31 + ch.charCodeAt(0)) >>> 0), 0);
  const start = list.length > 0 ? hash % list.length : 0;
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    images.push(list[(start + i) % list.length]);
  }
  return images;
};

import { mockCategoriesWithSubcategories } from './mockDataEnhanced';

// Export paint categories with subcategories
export const mockCategories: Category[] = mockCategoriesWithSubcategories;

// Paint store mock products
export const mockProducts: Product[] = [
  // Interior Paint - Eggshell
  {
    id: 'paint-p1',
    slug: 'interior-eggshell-pure-white-1gal',
    title: 'Premium Interior Paint – Eggshell, Pure White (1 Gal)',
    description: 'Low-odor, low-VOC interior wall paint with durable, washable eggshell finish. Excellent hide and smooth application.',
    price: 39.99,
    originalPrice: 49.99,
    currency: 'USD',
    images: getProductImages('interior-eggshell-white-1gal', 4),
    category: 'interior-paint',
    subcategory: 'eggshell',
    tags: ['interior', 'eggshell', 'washable', 'low-voc'],
    rating: 4.7,
    reviewCount: 124,
    stock: 42,
    sku: 'INT-EGG-WHT-1G',
    brand: 'ColorCrafters',
    features: ['Low Odor', 'Low VOC', 'Great Coverage', 'Washable'],
    specifications: {
      'Color': 'Pure White',
      'Color Family': 'White',
      'Color Hex': '#F5F5F5',
      'Finish': 'Eggshell',
      'Sheen': 'Eggshell',
      'Base': 'Ultra White',
      'Volume': '1 gal',
      'Coverage': '350-400 sq ft/gal',
      'Application': 'Interior',
      'VOC g/L': '45',
      'Dry Time': '1 hour to touch',
      'Recoat Time': '2 hours',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: true,
    isOnSale: true,
    dateAdded: '2024-02-01T10:00:00Z',
    dateModified: '2024-02-01T10:00:00Z',
  },

  // Interior Paint - Satin Gray
  {
    id: 'paint-p2',
    slug: 'interior-satin-repose-gray-1gal',
    title: 'Premium Interior Paint – Satin, Repose Gray (1 Gal)',
    description: 'Smooth satin finish ideal for hallways and living areas. Excellent scrub resistance and stain repellency.',
    price: 44.99,
    currency: 'USD',
    images: getProductImages('interior-satin-gray-1gal', 4),
    category: 'interior-paint',
    subcategory: 'satin',
    tags: ['interior', 'satin', 'washable', 'stain-resistant'],
    rating: 4.6,
    reviewCount: 88,
    stock: 30,
    sku: 'INT-SAT-GRY-1G',
    brand: 'ColorCrafters',
    features: ['Washable', 'Stain Resistant', 'Smooth Finish'],
    specifications: {
      'Color': 'Repose Gray',
      'Color Family': 'Gray',
      'Color Hex': '#CFCFCF',
      'Finish': 'Satin',
      'Sheen': 'Satin',
      'Base': 'Neutral',
      'Volume': '1 gal',
      'Coverage': '350-400 sq ft/gal',
      'Application': 'Interior',
      'VOC g/L': '50',
      'Dry Time': '1 hour',
      'Recoat Time': '2 hours',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: true,
    isFeatured: true,
    isOnSale: false,
    dateAdded: '2024-02-05T09:00:00Z',
    dateModified: '2024-02-05T09:00:00Z',
  },

  // Interior Paint - Semi-Gloss Trim
  {
    id: 'paint-p3',
    slug: 'interior-semi-gloss-bright-white-trim-1gal',
    title: 'Interior Trim & Door Paint – Semi-Gloss, Bright White (1 Gal)',
    description: 'Hard-wearing semi-gloss finish designed for trim, doors, and cabinets. Fast-drying and block resistant.',
    price: 49.99,
    currency: 'USD',
    images: getProductImages('interior-semigloss-trim-white-1gal', 3),
    category: 'interior-paint',
    subcategory: 'semi-gloss',
    tags: ['interior', 'semi-gloss', 'trim', 'doors'],
    rating: 4.8,
    reviewCount: 163,
    stock: 18,
    sku: 'INT-SG-TRIM-1G',
    brand: 'ProFinish',
    features: ['Block Resistant', 'Fast Drying', 'Durable'],
    specifications: {
      'Color': 'Bright White',
      'Color Family': 'White',
      'Color Hex': '#FFFFFF',
      'Finish': 'Semi-Gloss',
      'Sheen': 'Semi-Gloss',
      'Base': 'Ultra White',
      'Volume': '1 gal',
      'Coverage': '350 sq ft/gal',
      'Application': 'Interior',
      'VOC g/L': '48',
      'Dry Time': '45 minutes',
      'Recoat Time': '2 hours',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: true,
    isOnSale: false,
    dateAdded: '2024-02-03T12:00:00Z',
    dateModified: '2024-02-03T12:00:00Z',
  },

  // Exterior Paint - Satin
  {
    id: 'paint-p4',
    slug: 'exterior-satin-storm-gray-1gal',
    title: 'Exterior Paint – Satin, Storm Gray (1 Gal)',
    description: 'All-weather exterior satin paint with UV resistance and mildew resistance. Excellent adhesion and hide.',
    price: 46.99,
    originalPrice: 56.99,
    currency: 'USD',
    images: getProductImages('exterior-satin-gray-1gal', 3),
    category: 'exterior-paint',
    subcategory: 'exterior-satin',
    tags: ['exterior', 'satin', 'uv-resistant', 'mildew-resistant'],
    rating: 4.5,
    reviewCount: 74,
    stock: 26,
    sku: 'EXT-SAT-GRY-1G',
    brand: 'WeatherGuard',
    features: ['UV Resistant', 'Mildew Resistant', 'Great Adhesion'],
    specifications: {
      'Color': 'Storm Gray',
      'Color Family': 'Gray',
      'Color Hex': '#9AA0A6',
      'Finish': 'Satin',
      'Sheen': 'Satin',
      'Base': 'Deep Base',
      'Volume': '1 gal',
      'Coverage': '300-350 sq ft/gal',
      'Application': 'Exterior',
      'VOC g/L': '90',
      'Dry Time': '1 hour',
      'Recoat Time': '4 hours',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    dateAdded: '2024-02-06T08:00:00Z',
    dateModified: '2024-02-06T08:00:00Z',
  },

  // Exterior Paint - Semi-Gloss Door & Trim
  {
    id: 'paint-p5',
    slug: 'exterior-semi-gloss-door-trim-bright-white-1gal',
    title: 'Exterior Door & Trim – Semi-Gloss, Bright White (1 Gal)',
    description: 'Highly durable semi-gloss paint formulated for exterior doors and trim. Excellent flow and leveling.',
    price: 52.99,
    currency: 'USD',
    images: getProductImages('exterior-semigloss-doortrim-white-1gal', 3),
    category: 'exterior-paint',
    subcategory: 'exterior-semi-gloss',
    tags: ['exterior', 'semi-gloss', 'trim', 'doors'],
    rating: 4.6,
    reviewCount: 92,
    stock: 22,
    sku: 'EXT-SG-TRIM-1G',
    brand: 'ProFinish',
    features: ['High Durability', 'Great Flow & Leveling', 'Weather Resistant'],
    specifications: {
      'Color': 'Bright White',
      'Color Family': 'White',
      'Color Hex': '#FFFFFF',
      'Finish': 'Semi-Gloss',
      'Sheen': 'Semi-Gloss',
      'Base': 'Ultra White',
      'Volume': '1 gal',
      'Coverage': '300-350 sq ft/gal',
      'Application': 'Exterior',
      'VOC g/L': '85',
      'Dry Time': '1 hour',
      'Recoat Time': '4 hours',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: true,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-08T11:00:00Z',
    dateModified: '2024-02-08T11:00:00Z',
  },

  // Primer - Multi-purpose
  {
    id: 'paint-p6',
    slug: 'multi-purpose-primer-white-1gal',
    title: 'Multi-Purpose Primer – White (1 Gal)',
    description: 'Seals, blocks stains, and promotes adhesion on multiple surfaces. Fast-drying and sandable.',
    price: 24.99,
    currency: 'USD',
    images: getProductImages('primer-multipurpose-white-1gal', 2),
    category: 'primers',
    subcategory: 'multi-purpose-primer',
    tags: ['primer', 'multi-purpose', 'stain-blocking'],
    rating: 4.5,
    reviewCount: 58,
    stock: 50,
    sku: 'PRM-MULTI-1G',
    brand: 'SealPro',
    features: ['Fast Drying', 'Sandable', 'Adhesion Promoter'],
    specifications: {
      'Color': 'White',
      'Finish': 'Flat',
      'Sheen': 'Flat',
      'Volume': '1 gal',
      'Coverage': '300-400 sq ft/gal',
      'Application': 'Interior/Exterior',
      'VOC g/L': '50',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-02T10:00:00Z',
    dateModified: '2024-02-02T10:00:00Z',
  },

  // Deck Stain
  {
    id: 'paint-p7',
    slug: 'deck-stain-semi-transparent-cedar-1gal',
    title: 'Deck & Fence Stain – Semi-Transparent, Cedar (1 Gal)',
    description: 'Penetrating oil-based stain for decks and fences. Enhances wood grain while providing protection.',
    price: 35.99,
    currency: 'USD',
    images: getProductImages('deck-stain-cedar-1gal', 3),
    category: 'stains-varnishes',
    subcategory: 'deck-stain',
    tags: ['exterior', 'stain', 'semi-transparent'],
    rating: 4.4,
    reviewCount: 41,
    stock: 34,
    sku: 'STN-DEX-SED-1G',
    brand: 'WoodGuard',
    features: ['Penetrating Oil', 'UV Protection', 'Water Repellent'],
    specifications: {
      'Color': 'Cedar',
      'Color Family': 'Brown',
      'Color Hex': '#C26A3D',
      'Finish': 'Semi-Transparent',
      'Sheen': 'Matte',
      'Base': 'Oil-Based',
      'Volume': '1 gal',
      'Coverage': '250-350 sq ft/gal',
      'Application': 'Exterior',
      'VOC g/L': '350',
      'Clean Up': 'Mineral Spirits',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    dateAdded: '2024-02-04T10:00:00Z',
    dateModified: '2024-02-04T10:00:00Z',
  },

  // Polyurethane
  {
    id: 'paint-p8',
    slug: 'polyurethane-clear-satin-1qt',
    title: 'Polyurethane – Clear Satin (1 Qt)',
    description: 'Durable protective finish for interior wood surfaces. Crystal-clear, non-yellowing.',
    price: 18.99,
    currency: 'USD',
    images: getProductImages('polyurethane-clear-satin-1qt', 2),
    category: 'stains-varnishes',
    subcategory: 'polyurethane',
    tags: ['interior', 'clear-finish', 'polyurethane'],
    rating: 4.6,
    reviewCount: 53,
    stock: 60,
    sku: 'POLY-SAT-1Q',
    brand: 'WoodGuard',
    features: ['Non-Yellowing', 'Durable', 'Clear Finish'],
    specifications: {
      'Color': 'Clear',
      'Finish': 'Satin',
      'Sheen': 'Satin',
      'Volume': '1 qt',
      'Coverage': '125-150 sq ft/qt',
      'Application': 'Interior',
      'VOC g/L': '450',
      'Clean Up': 'Mineral Spirits',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-07T10:00:00Z',
    dateModified: '2024-02-07T10:00:00Z',
  },

  // Chalk Paint
  {
    id: 'paint-p9',
    slug: 'chalk-paint-antique-white-1qt',
    title: 'Chalk & Furniture Paint – Antique White (1 Qt)',
    description: 'Ultra-matte chalk finish for furniture and decor. Excellent adhesion, minimal prep.',
    price: 22.99,
    currency: 'USD',
    images: getProductImages('chalk-paint-antique-white-1qt', 3),
    category: 'specialty-coatings',
    subcategory: 'chalk-paint',
    tags: ['chalk', 'furniture', 'ultra-matte'],
    rating: 4.5,
    reviewCount: 39,
    stock: 28,
    sku: 'CHK-ANTWHT-1Q',
    brand: 'ArtisanCoat',
    features: ['Ultra-Matte', 'Minimal Prep', 'Great Adhesion'],
    specifications: {
      'Color': 'Antique White',
      'Color Family': 'White',
      'Color Hex': '#FAF6EA',
      'Finish': 'Ultra-Matte',
      'Sheen': 'Matte',
      'Volume': '1 qt',
      'Coverage': '100-150 sq ft/qt',
      'Application': 'Interior',
      'VOC g/L': '50',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: true,
    isFeatured: true,
    isOnSale: false,
    dateAdded: '2024-02-10T10:00:00Z',
    dateModified: '2024-02-10T10:00:00Z',
  },

  // Cabinet Paint
  {
    id: 'paint-p10',
    slug: 'cabinet-paint-satin-pure-white-1gal',
    title: 'Cabinet & Trim Paint – Satin, Pure White (1 Gal)',
    description: 'Factory-like finish with exceptional hardness and adhesion. Ideal for cabinets and trim.',
    price: 59.99,
    currency: 'USD',
    images: getProductImages('cabinet-paint-satin-white-1gal', 3),
    category: 'specialty-coatings',
    subcategory: 'cabinet-paint',
    tags: ['interior', 'cabinet', 'trim', 'hard-drying'],
    rating: 4.7,
    reviewCount: 77,
    stock: 16,
    sku: 'CAB-SAT-WHT-1G',
    brand: 'ProFinish',
    features: ['Exceptional Hardness', 'Great Adhesion', 'Smooth Leveling'],
    specifications: {
      'Color': 'Pure White',
      'Color Family': 'White',
      'Color Hex': '#FFFFFF',
      'Finish': 'Satin',
      'Sheen': 'Satin',
      'Base': 'Ultra White',
      'Volume': '1 gal',
      'Coverage': '300-350 sq ft/gal',
      'Application': 'Interior',
      'VOC g/L': '80',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: true,
    isOnSale: false,
    dateAdded: '2024-02-11T12:00:00Z',
    dateModified: '2024-02-11T12:00:00Z',
  },

  // Masonry Waterproofing
  {
    id: 'paint-p11',
    slug: 'masonry-waterproofing-white-5gal',
    title: 'Masonry Waterproofing – White (5 Gal)',
    description: 'Breathable, waterproof coating for concrete and masonry. Resists hydrostatic pressure.',
    price: 159.99,
    currency: 'USD',
    images: getProductImages('masonry-waterproofing-white-5gal', 2),
    category: 'specialty-coatings',
    subcategory: 'masonry-waterproofing',
    tags: ['exterior', 'waterproofing', 'masonry'],
    rating: 4.3,
    reviewCount: 28,
    stock: 8,
    sku: 'MAS-WTR-WHT-5G',
    brand: 'SealPro',
    features: ['Waterproof', 'Breathable', 'Resists Pressure'],
    specifications: {
      'Color': 'White',
      'Finish': 'Flat',
      'Sheen': 'Flat',
      'Volume': '5 gal',
      'Coverage': '75-125 sq ft/gal',
      'Application': 'Exterior',
      'VOC g/L': '95',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    dateAdded: '2024-02-09T10:00:00Z',
    dateModified: '2024-02-09T10:00:00Z',
  },

  // Tools & Supplies - Roller Kit
  {
    id: 'paint-p12',
    slug: 'roller-kit-9in-5pc',
    title: '9" Roller Kit – 5 Piece',
    description: 'Complete roller kit with tray, frame, and covers. Ideal for walls and ceilings.',
    price: 14.99,
    currency: 'USD',
    images: getProductImages('roller-kit-9in-5pc', 2),
    category: 'tools-supplies',
    subcategory: 'brushes-rollers',
    tags: ['tools', 'rollers', 'kit'],
    rating: 4.4,
    reviewCount: 65,
    stock: 100,
    sku: 'KIT-ROLLER-5',
    brand: 'ProTools',
    features: ['Complete Kit', 'Smooth Finish', 'Reusable'],
    specifications: {
      'Pieces': '5',
      'Roller Width': '9 in',
      'Nap': '3/8 in',
      'Application': 'Interior/Exterior',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-01T10:00:00Z',
    dateModified: '2024-02-01T10:00:00Z',
  },

  // Tools & Supplies - Angle Brush
  {
    id: 'paint-p13',
    slug: 'angle-brush-2in',
    title: '2" Angle Sash Brush – Premium',
    description: 'High-quality angled brush for clean cut-ins with all paints. Stainless ferrule, hardwood handle.',
    price: 9.99,
    currency: 'USD',
    images: getProductImages('angle-brush-2in', 2),
    category: 'tools-supplies',
    subcategory: 'brushes-rollers',
    tags: ['tools', 'brushes'],
    rating: 4.7,
    reviewCount: 112,
    stock: 200,
    sku: 'BR-ANG-2IN',
    brand: 'ProTools',
    features: ['Stainless Ferrule', 'Smooth Filament', 'Comfort Handle'],
    specifications: {
      'Brush Width': '2 in',
      'Filament': 'Nylon/Polyester Blend',
      'Application': 'Interior/Exterior',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-01T10:00:00Z',
    dateModified: '2024-02-01T10:00:00Z',
  },

  // Interior Paint – Flat Ceiling Paint
  {
    id: 'paint-p14',
    slug: 'interior-flat-ceiling-ultra-white-1gal',
    title: 'Ceiling Paint – Ultra Flat, Ultra White (1 Gal)',
    description: 'Spatter-resistant ultra-flat finish designed for ceilings. Excellent hide and coverage.',
    price: 32.99,
    currency: 'USD',
    images: getProductImages('interior-flat-ceiling-white-1gal', 3),
    category: 'interior-paint',
    subcategory: 'flat-matte',
    tags: ['interior', 'flat', 'ceiling'],
    rating: 4.3,
    reviewCount: 59,
    stock: 24,
    sku: 'INT-FLAT-CLG-1G',
    brand: 'ColorCrafters',
    features: ['Ultra Flat', 'Spatter Resistant', 'Great Hide'],
    specifications: {
      'Color': 'Ultra White',
      'Color Family': 'White',
      'Color Hex': '#FFFFFF',
      'Finish': 'Flat',
      'Sheen': 'Flat',
      'Base': 'Ultra White',
      'Volume': '1 gal',
      'Coverage': '400 sq ft/gal',
      'Application': 'Interior',
      'VOC g/L': '40',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-12T10:00:00Z',
    dateModified: '2024-02-12T10:00:00Z',
  },

  // Interior Paint – Accent Color
  {
    id: 'paint-p15',
    slug: 'interior-matte-deep-blue-1qt',
    title: 'Interior Paint – Matte, Deep Blue (1 Qt)',
    description: 'Rich, bold accent color in a matte finish. Great for feature walls and decor.',
    price: 14.99,
    currency: 'USD',
    images: getProductImages('interior-matte-deep-blue-1qt', 3),
    category: 'interior-paint',
    subcategory: 'flat-matte',
    tags: ['interior', 'matte', 'accent'],
    rating: 4.2,
    reviewCount: 21,
    stock: 36,
    sku: 'INT-MAT-BLU-1Q',
    brand: 'ColorCrafters',
    features: ['Rich Color', 'Smooth Application'],
    specifications: {
      'Color': 'Deep Blue',
      'Color Family': 'Blue',
      'Color Hex': '#1E3A8A',
      'Finish': 'Matte',
      'Sheen': 'Flat',
      'Base': 'Deep Base',
      'Volume': '1 qt',
      'Coverage': '100 sq ft/qt',
      'Application': 'Interior',
      'VOC g/L': '50',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: true,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-13T10:00:00Z',
    dateModified: '2024-02-13T10:00:00Z',
  },

  // Exterior Paint – Flat
  {
    id: 'paint-p16',
    slug: 'exterior-flat-tan-1gal',
    title: 'Exterior Paint – Flat, Desert Tan (1 Gal)',
    description: 'Non-reflective flat finish for large exterior surfaces. Good hide and touch-up.',
    price: 41.99,
    currency: 'USD',
    images: getProductImages('exterior-flat-tan-1gal', 3),
    category: 'exterior-paint',
    subcategory: 'exterior-flat',
    tags: ['exterior', 'flat'],
    rating: 4.1,
    reviewCount: 19,
    stock: 20,
    sku: 'EXT-FLT-TAN-1G',
    brand: 'WeatherGuard',
    features: ['Good Hide', 'Non-Reflective'],
    specifications: {
      'Color': 'Desert Tan',
      'Color Family': 'Beige',
      'Color Hex': '#D2B48C',
      'Finish': 'Flat',
      'Sheen': 'Flat',
      'Base': 'Medium Base',
      'Volume': '1 gal',
      'Coverage': '300-350 sq ft/gal',
      'Application': 'Exterior',
      'VOC g/L': '95',
      'Clean Up': 'Soap & Water',
    },
    status: 'published',
    isNew: false,
    isFeatured: false,
    isOnSale: false,
    dateAdded: '2024-02-14T10:00:00Z',
    dateModified: '2024-02-14T10:00:00Z',
  },
];

// Function to initialize mock data in localStorage
export function initializeMockData(): void {
  // Check if data already exists
  const existingProducts = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, null);
  const existingCategories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, null);

  // Detect non-paint data and migrate
  const hasPaintRoots = (existingCategories || []).some(c => ['interior-paint','exterior-paint','primers','stains-varnishes','specialty-coatings','tools-supplies'].includes(c.slug));
  if (!existingCategories || existingCategories.length === 0 || !hasPaintRoots) {
    Storage.set(STORAGE_KEYS.CATEGORIES, mockCategories);
    console.log('✅ Categories set to paint store');
    // If categories switched to paint, also seed paint products
    Storage.set(STORAGE_KEYS.PRODUCTS, mockProducts);
    console.log('✅ Products set to paint store');
  } else if (!existingProducts || existingProducts.length === 0) {
    Storage.set(STORAGE_KEYS.PRODUCTS, mockProducts);
    console.log('✅ Mock products initialized (paint store)');
  }

  // Initialize empty arrays for user-specific data if they don't exist
  if (!Storage.get(STORAGE_KEYS.CART)) {
    Storage.set(STORAGE_KEYS.CART, null);
  }

  if (!Storage.get(STORAGE_KEYS.FAVOURITES)) {
    Storage.set(STORAGE_KEYS.FAVOURITES, []);
  }

  if (!Storage.get(STORAGE_KEYS.ORDERS)) {
    Storage.set(STORAGE_KEYS.ORDERS, []);
  }

  console.log('🎉 Mock data initialization complete');
}

// Function to reset all data (useful for testing)
export function resetMockData(): void {
  Storage.clear();
  initializeMockData();
  console.log('🔄 Mock data reset complete');
}

// Function to add sample products (not used for paint store)
export function addSampleProducts(count: number = 0): Product[] {
  return Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
}

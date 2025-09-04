export interface Theme {
  id: string;
  name: string;
  description?: string;
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean and modern default theme'
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low-light environments'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming blue ocean-inspired theme'
  }
];

export const DEFAULT_THEME = 'default';

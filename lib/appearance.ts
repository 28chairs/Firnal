export type ThemePreset = 'cream-journal' | 'midnight' | 'soft-pastel' | 'structured-blue';
export type FontSize = 'compact' | 'comfortable' | 'large';
export type Density = 'compact' | 'comfortable';
export type FontStyle = 'sans' | 'rounded';

export interface AppearanceSettings {
  theme: ThemePreset;
  accentColor: string;
  fontSize: FontSize;
  density: Density;
  fontStyle: FontStyle;
}

export const DEFAULT_SETTINGS: AppearanceSettings = {
  theme: 'cream-journal',
  accentColor: '#E11D48',
  fontSize: 'comfortable',
  density: 'comfortable',
  fontStyle: 'sans',
};

export const THEME_PRESETS: Record<
  ThemePreset,
  {
    name: string;
    description: string;
    defaultAccent: string;
    preview: { bg: string; card: string; accent: string };
  }
> = {
  'cream-journal': {
    name: 'Cream Journal',
    description: 'Warm paper tones with rose accents',
    defaultAccent: '#E11D48',
    preview: { bg: '#FAF9F6', card: '#FFFFFF', accent: '#E11D48' },
  },
  midnight: {
    name: 'Midnight',
    description: 'Dark-first with cool blue glow',
    defaultAccent: '#60A5FA',
    preview: { bg: '#0F172A', card: '#1E293B', accent: '#60A5FA' },
  },
  'soft-pastel': {
    name: 'Soft Pastel',
    description: 'Muted pastels, calm and tranquil',
    defaultAccent: '#A78BFA',
    preview: { bg: '#FDF4FF', card: '#FFFFFF', accent: '#A78BFA' },
  },
  'structured-blue': {
    name: 'Structured Blue',
    description: 'iOS-inspired gray with slate blue',
    defaultAccent: '#6581A2',
    preview: { bg: '#F2F2F7', card: '#FFFFFF', accent: '#6581A2' },
  },
};

export const ACCENT_COLORS = [
  { name: 'Rose', value: '#E11D48' },
  { name: 'Coral', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Slate', value: '#6581A2' },
] as const;

export const FONT_SIZE_LABELS: Record<FontSize, { label: string; scale: number }> = {
  compact: { label: 'Compact', scale: 0.9 },
  comfortable: { label: 'Comfortable', scale: 1 },
  large: { label: 'Large', scale: 1.15 },
};

export const DENSITY_LABELS: Record<Density, { label: string; description: string }> = {
  compact: { label: 'Compact', description: 'Tighter spacing, more content visible' },
  comfortable: { label: 'Comfortable', description: 'Relaxed spacing, easier reading' },
};

export const FONT_STYLE_LABELS: Record<FontStyle, { label: string; description: string }> = {
  sans: { label: 'Sans', description: 'Clean and modern' },
  rounded: { label: 'Soft Rounded', description: 'Friendly and approachable' },
};

const STORAGE_KEY = 'firnal-appearance';

export function loadAppearance(): AppearanceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored);
    return {
      theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
      accentColor: parsed.accentColor ?? DEFAULT_SETTINGS.accentColor,
      fontSize: parsed.fontSize ?? DEFAULT_SETTINGS.fontSize,
      density: parsed.density ?? DEFAULT_SETTINGS.density,
      fontStyle: parsed.fontStyle ?? DEFAULT_SETTINGS.fontStyle,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppearance(settings: AppearanceSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable
  }
}

export function getThemeClass(theme: ThemePreset): string {
  return `theme-${theme}`;
}

export function getFontSizeClass(fontSize: FontSize): string {
  return `font-size-${fontSize}`;
}

export function getDensityClass(density: Density): string {
  return `density-${density}`;
}

export function getFontStyleClass(fontStyle: FontStyle): string {
  return `font-style-${fontStyle}`;
}

export function applyAppearanceToDocument(settings: AppearanceSettings): void {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;

  // Remove existing theme classes
  Object.keys(THEME_PRESETS).forEach((t) => {
    html.classList.remove(getThemeClass(t as ThemePreset));
  });

  // Remove existing font size classes
  Object.keys(FONT_SIZE_LABELS).forEach((s) => {
    html.classList.remove(getFontSizeClass(s as FontSize));
  });

  // Remove existing density classes
  Object.keys(DENSITY_LABELS).forEach((d) => {
    html.classList.remove(getDensityClass(d as Density));
  });

  // Remove existing font style classes
  Object.keys(FONT_STYLE_LABELS).forEach((f) => {
    html.classList.remove(getFontStyleClass(f as FontStyle));
  });

  // Apply new classes
  html.classList.add(getThemeClass(settings.theme));
  html.classList.add(getFontSizeClass(settings.fontSize));
  html.classList.add(getDensityClass(settings.density));
  html.classList.add(getFontStyleClass(settings.fontStyle));

  // Apply accent color as CSS custom property
  html.style.setProperty('--accent-override', settings.accentColor);

  // Handle dark class for midnight theme
  if (settings.theme === 'midnight') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

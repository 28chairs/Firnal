'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  applyAppearanceToDocument,
  DEFAULT_SETTINGS,
  loadAppearance,
  saveAppearance,
  THEME_PRESETS,
  type AppearanceSettings,
  type Density,
  type FontSize,
  type FontStyle,
  type ThemePreset,
} from './appearance';

interface AppearanceContextValue {
  settings: AppearanceSettings;
  setTheme: (theme: ThemePreset) => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: FontSize) => void;
  setDensity: (density: Density) => void;
  setFontStyle: (style: FontStyle) => void;
  resetToDefaults: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

const APPEARANCE_CHANGED_EVENT = 'firnal-appearance-changed';

let cachedSettings: AppearanceSettings | null = null;

function getSnapshot(): AppearanceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  if (!cachedSettings) {
    cachedSettings = loadAppearance();
  }
  return cachedSettings;
}

function getServerSnapshot(): AppearanceSettings {
  return DEFAULT_SETTINGS;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(APPEARANCE_CHANGED_EVENT, callback);
  return () => window.removeEventListener(APPEARANCE_CHANGED_EVENT, callback);
}

function notifyChange(): void {
  window.dispatchEvent(new Event(APPEARANCE_CHANGED_EVENT));
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyAppearanceToDocument(settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppearanceSettings>) => {
    const current = getSnapshot();
    const next = { ...current, ...updates };
    cachedSettings = next;
    saveAppearance(next);
    applyAppearanceToDocument(next);
    notifyChange();
  }, []);

  const setTheme = useCallback(
    (theme: ThemePreset) => {
      const preset = THEME_PRESETS[theme];
      updateSettings({
        theme,
        accentColor: preset.defaultAccent,
      });
    },
    [updateSettings]
  );

  const setAccentColor = useCallback(
    (accentColor: string) => {
      updateSettings({ accentColor });
    },
    [updateSettings]
  );

  const setFontSize = useCallback(
    (fontSize: FontSize) => {
      updateSettings({ fontSize });
    },
    [updateSettings]
  );

  const setDensity = useCallback(
    (density: Density) => {
      updateSettings({ density });
    },
    [updateSettings]
  );

  const setFontStyle = useCallback(
    (fontStyle: FontStyle) => {
      updateSettings({ fontStyle });
    },
    [updateSettings]
  );

  const resetToDefaults = useCallback(() => {
    cachedSettings = DEFAULT_SETTINGS;
    saveAppearance(DEFAULT_SETTINGS);
    applyAppearanceToDocument(DEFAULT_SETTINGS);
    notifyChange();
  }, []);

  return (
    <AppearanceContext.Provider
      value={{
        settings,
        setTheme,
        setAccentColor,
        setFontSize,
        setDensity,
        setFontStyle,
        resetToDefaults,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}

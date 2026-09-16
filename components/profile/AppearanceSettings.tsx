'use client';

import { useState } from 'react';
import { Check, ChevronDown, Palette, RotateCcw, Type, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppearance } from '@/lib/appearance-context';
import {
  ACCENT_COLORS,
  DENSITY_LABELS,
  FONT_SIZE_LABELS,
  FONT_STYLE_LABELS,
  THEME_PRESETS,
  type Density,
  type FontSize,
  type FontStyle,
  type ThemePreset,
} from '@/lib/appearance';
import { cn } from '@/lib/utils';

export function AppearanceSettings() {
  const [open, setOpen] = useState(false);
  const { settings, setTheme, setAccentColor, setFontSize, setDensity, setFontStyle, resetToDefaults } =
    useAppearance();

  const themeName = THEME_PRESETS[settings.theme]?.name ?? settings.theme;
  const accent = ACCENT_COLORS.find((c) => c.value === settings.accentColor);
  const summary = `${themeName} · ${FONT_SIZE_LABELS[settings.fontSize].label} · ${FONT_STYLE_LABELS[settings.fontStyle].label}`;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-h-11 items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${settings.accentColor}22`, color: settings.accentColor }}
        >
          <Palette className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-tight">Appearance</p>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{summary}</p>
        </div>
        {accent ? (
          <span
            className="size-3.5 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: accent.value }}
            aria-hidden
          />
        ) : null}
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <CardContent className="flex flex-col gap-6 border-t border-border/60 pb-5 pt-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1 size-3" />
              Reset
            </Button>
          </div>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
                const preset = THEME_PRESETS[key];
                const isActive = settings.theme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={cn(
                      'group relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all duration-200',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30',
                    )}
                  >
                    <div className="flex h-10 w-full overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5">
                      <div className="w-1/2" style={{ backgroundColor: preset.preview.bg }} />
                      <div className="w-1/4" style={{ backgroundColor: preset.preview.card }} />
                      <div className="w-1/4" style={{ backgroundColor: preset.preview.accent }} />
                    </div>
                    <div className="flex w-full items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium leading-tight">{preset.name}</p>
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Accent Color</h3>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color) => {
                const isActive = settings.accentColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setAccentColor(color.value)}
                    title={color.name}
                    className={cn(
                      'relative size-8 rounded-full transition-all duration-150 focus-ring',
                      isActive
                        ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background'
                        : 'hover:scale-105',
                    )}
                    style={{ backgroundColor: color.value }}
                  >
                    {isActive && (
                      <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">Changes the FAB and primary accents</p>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Type className="size-3.5" />
              Font Size
            </h3>
            <div className="flex gap-2">
              {(Object.keys(FONT_SIZE_LABELS) as FontSize[]).map((key) => {
                const { label } = FONT_SIZE_LABELS[key];
                const isActive = settings.fontSize === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFontSize(key)}
                    className={cn(
                      'min-h-11 flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Font Style</h3>
            <div className="flex gap-2">
              {(Object.keys(FONT_STYLE_LABELS) as FontStyle[]).map((key) => {
                const { label, description } = FONT_STYLE_LABELS[key];
                const isActive = settings.fontStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFontStyle(key)}
                    className={cn(
                      'min-h-11 flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-all duration-150',
                      isActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border/60 bg-card hover:border-primary/40',
                    )}
                  >
                    <p className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Maximize2 className="size-3.5" />
              Density
            </h3>
            <div className="flex gap-2">
              {(Object.keys(DENSITY_LABELS) as Density[]).map((key) => {
                const { label, description } = DENSITY_LABELS[key];
                const isActive = settings.density === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDensity(key)}
                    className={cn(
                      'min-h-11 flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-all duration-150',
                      isActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border/60 bg-card hover:border-primary/40',
                    )}
                  >
                    <p className={cn('text-sm font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </CardContent>
      ) : null}
    </Card>
  );
}

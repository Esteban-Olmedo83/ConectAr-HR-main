'use client';

import { useTheme, VisualTheme } from '@/hooks/use-theme';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette, Globe } from 'lucide-react';

interface ThemePreviewConfig {
  key: VisualTheme;
  sidebar: string;
  primary: string;
  bg: string;
}

const themePreviewConfig: ThemePreviewConfig[] = [
  { key: 'clasico',   sidebar: '#1e2a4a', primary: '#3b82f6', bg: '#f0f4ff' },
  { key: 'dark',      sidebar: '#0f1117', primary: '#60a5fa', bg: '#13141a' },
  { key: 'purpura',   sidebar: '#2e1065', primary: '#7c3aed', bg: '#faf5ff' },
  { key: 'esmeralda', sidebar: '#064e3b', primary: '#10b981', bg: '#f0fdf4' },
  { key: 'sunset',    sidebar: '#7c2d12', primary: '#f97316', bg: '#fff7ed' },
];

function ThemeCard({
  config,
  label,
  isSelected,
  onClick,
}: {
  config: ThemePreviewConfig;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="cursor-pointer rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg"
      style={{
        border: isSelected
          ? `2px solid ${config.primary}`
          : '2px solid transparent',
        outline: isSelected ? `3px solid ${config.primary}33` : 'none',
        outlineOffset: '2px',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select ${label} theme`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      {/* Mini preview */}
      <div
        className="flex h-20 w-36"
        style={{ background: config.bg }}
      >
        {/* Sidebar strip */}
        <div
          className="w-10 h-full flex-shrink-0"
          style={{ background: config.sidebar }}
        />
        {/* Content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar (primary) */}
          <div
            className="h-4 w-full flex-shrink-0"
            style={{ background: config.primary }}
          />
          {/* Body */}
          <div
            className="flex-1 p-1 space-y-1"
            style={{ background: config.bg }}
          >
            <div
              className="h-1.5 w-3/4 rounded"
              style={{ background: config.primary + '55' }}
            />
            <div
              className="h-1.5 w-1/2 rounded"
              style={{ background: config.primary + '33' }}
            />
            <div className="grid grid-cols-2 gap-0.5 mt-1">
              <div
                className="h-4 rounded"
                style={{ background: config.primary + '33' }}
              />
              <div
                className="h-4 rounded"
                style={{ background: config.primary + '1a' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Label row */}
      <div
        className="px-2 py-1.5 flex items-center justify-between"
        style={{ background: 'hsl(var(--background))' }}
      >
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {isSelected && (
          <Check
            className="h-3.5 w-3.5 flex-shrink-0"
            style={{ color: config.primary }}
          />
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  const themeLabels: Record<VisualTheme, string> = {
    clasico: t.settings.themes.clasico,
    dark: t.settings.themes.dark,
    purpura: t.settings.themes.purpura,
    esmeralda: t.settings.themes.esmeralda,
    sunset: t.settings.themes.sunset,
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold font-headline">{t.settings.title}</h1>
        <p className="text-muted-foreground mt-2">{t.settings.subtitle}</p>
      </header>

      {/* Appearance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            {t.settings.appearance}
          </CardTitle>
          <CardDescription>{t.settings.appearanceDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {themePreviewConfig.map((config) => (
              <ThemeCard
                key={config.key}
                config={config}
                label={themeLabels[config.key]}
                isSelected={theme === config.key}
                onClick={() => setTheme(config.key)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t.settings.language}
          </CardTitle>
          <CardDescription>{t.settings.languageDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {/* Spanish button */}
            <button
              className="flex items-center gap-2.5 rounded-xl border-2 px-5 py-3 font-medium text-sm transition-all duration-200 hover:scale-105"
              style={{
                borderColor: locale === 'es' ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                background: locale === 'es' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                color: locale === 'es' ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                outline: locale === 'es' ? '3px solid hsl(var(--primary) / 0.25)' : 'none',
                outlineOffset: '2px',
              }}
              onClick={() => setLocale('es')}
              aria-label="Cambiar a Español"
              aria-pressed={locale === 'es'}
            >
              <span className="text-lg" role="img" aria-label="Argentina flag">🇦🇷</span>
              <span>Español</span>
              {locale === 'es' && <Check className="h-4 w-4 ml-1" />}
            </button>

            {/* English button */}
            <button
              className="flex items-center gap-2.5 rounded-xl border-2 px-5 py-3 font-medium text-sm transition-all duration-200 hover:scale-105"
              style={{
                borderColor: locale === 'en' ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                background: locale === 'en' ? 'hsl(var(--accent))' : 'hsl(var(--card))',
                color: locale === 'en' ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
                outline: locale === 'en' ? '3px solid hsl(var(--primary) / 0.25)' : 'none',
                outlineOffset: '2px',
              }}
              onClick={() => setLocale('en')}
              aria-label="Switch to English"
              aria-pressed={locale === 'en'}
            >
              <span className="text-lg" role="img" aria-label="US flag">🇺🇸</span>
              <span>English</span>
              {locale === 'en' && <Check className="h-4 w-4 ml-1" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

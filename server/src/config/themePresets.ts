import { ThemePreset } from '../types/theme.types';

/**
 * Versioned theme presets — the source of truth for the Theme Studio gallery.
 * 6 clinic + 6 school. Each is a full brand (primary/secondary/accent + fonts).
 * The FIRST preset for a domain is that domain's default (used when a project
 * has no saved theme).
 */
export const THEME_PRESETS: ThemePreset[] = [
  // ── Clinic ──────────────────────────────────────────────────────
  {
    key: 'clinic-teal',
    name: 'Clinic Teal',
    domain: 'clinic',
    colors: { primary: '#0F766E', secondary: '#4F46E5', accent: '#34D399' },
    fonts: { heading: 'Poppins', body: 'Inter' },
  },
  {
    key: 'clinical-blue',
    name: 'Clinical Blue',
    domain: 'clinic',
    colors: { primary: '#1D4ED8', secondary: '#1E3A8A', accent: '#38BDF8' },
    fonts: { heading: 'Poppins', body: 'Inter' },
  },
  {
    key: 'calm-mint',
    name: 'Calm Mint',
    domain: 'clinic',
    colors: { primary: '#0D9488', secondary: '#115E59', accent: '#6EE7B7' },
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    key: 'warm-care',
    name: 'Warm Care',
    domain: 'clinic',
    colors: { primary: '#C2410C', secondary: '#9A3412', accent: '#FDBA74' },
    fonts: { heading: 'Poppins', body: 'Open Sans' },
  },
  {
    key: 'modern-slate',
    name: 'Modern Slate',
    domain: 'clinic',
    colors: { primary: '#334155', secondary: '#0EA5E9', accent: '#38BDF8' },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    key: 'lavender-care',
    name: 'Lavender Care',
    domain: 'clinic',
    colors: { primary: '#7C3AED', secondary: '#5B21B6', accent: '#C4B5FD' },
    fonts: { heading: 'Poppins', body: 'Inter' },
  },

  // ── School ──────────────────────────────────────────────────────
  {
    key: 'school-green',
    name: 'School Green',
    domain: 'school',
    colors: { primary: '#16A34A', secondary: '#15803D', accent: '#86EFAC' },
    fonts: { heading: 'Poppins', body: 'Inter' },
  },
  {
    key: 'academic-navy',
    name: 'Academic Navy',
    domain: 'school',
    colors: { primary: '#1E3A8A', secondary: '#1E40AF', accent: '#60A5FA' },
    fonts: { heading: 'Montserrat', body: 'Inter' },
  },
  {
    key: 'bright-learning',
    name: 'Bright Learning',
    domain: 'school',
    colors: { primary: '#CA8A04', secondary: '#A16207', accent: '#FDE047' },
    fonts: { heading: 'Poppins', body: 'Inter' },
  },
  {
    key: 'scholar-maroon',
    name: 'Scholar Maroon',
    domain: 'school',
    colors: { primary: '#9F1239', secondary: '#881337', accent: '#FB7185' },
    fonts: { heading: 'Montserrat', body: 'Open Sans' },
  },
  {
    key: 'fresh-indigo',
    name: 'Fresh Indigo',
    domain: 'school',
    colors: { primary: '#4F46E5', secondary: '#4338CA', accent: '#A5B4FC' },
    fonts: { heading: 'Poppins', body: 'Inter' },
  },
  {
    key: 'teal-campus',
    name: 'Teal Campus',
    domain: 'school',
    colors: { primary: '#0891B2', secondary: '#0E7490', accent: '#67E8F9' },
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
];

export const getThemePresets = (): ThemePreset[] => THEME_PRESETS;

export const getPresetsByDomain = (domain: 'clinic' | 'school'): ThemePreset[] =>
  THEME_PRESETS.filter((p) => p.domain === domain);

/** The default preset for a domain — the first one listed. */
export const getDefaultPreset = (domain: 'clinic' | 'school'): ThemePreset =>
  getPresetsByDomain(domain)[0] ?? THEME_PRESETS[0];

export const getPresetByKey = (key: string): ThemePreset | undefined =>
  THEME_PRESETS.find((p) => p.key === key);

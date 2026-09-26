/**
 * Per-project theme (Module 4). A `ThemeConfig` is a superset of the live
 * Preview's `PreviewThemeConfig` (brand colors + fonts), so it projects down 1:1
 * for the renderer and will later feed the Frontend Generator (Stage 6).
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemePreset {
  key: string;
  name: string;
  domain: 'clinic' | 'school';
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  presetKey?: string;
}

/** WCAG-AA contrast result, computed (not stored) and returned with a theme. */
export interface ThemeContrast {
  /** Contrast ratio of white text on the primary color (button legibility). */
  primaryOnWhite: number;
  passesAA: boolean;
}

/** What the theme endpoints return. */
export interface ThemeResponse extends ThemeConfig {
  contrast: ThemeContrast;
}

/** Fonts the studio offers (families the platform can render or fall back for). */
export const ALLOWED_FONTS = ['Poppins', 'Inter', 'Outfit', 'Roboto', 'Open Sans', 'Montserrat'] as const;
export type AllowedFont = typeof ALLOWED_FONTS[number];

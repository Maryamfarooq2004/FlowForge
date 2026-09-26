// Frontend mirror of the backend theme types (server/src/types/theme.types.ts).

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

export interface ThemeContrast {
  primaryOnWhite: number;
  passesAA: boolean;
}

export interface ThemeResponse extends ThemeConfig {
  contrast: ThemeContrast;
}

export const ALLOWED_FONTS = ['Poppins', 'Inter', 'Outfit', 'Roboto', 'Open Sans', 'Montserrat'] as const;

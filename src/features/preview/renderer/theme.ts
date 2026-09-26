import { createContext, useContext } from 'react';
import type { PreviewThemeConfig } from '../../../types/preview.types';

/** Default preview theme (brand palette). Phase 7 will swap in a per-project ThemeConfig. */
export const DEFAULT_THEME: PreviewThemeConfig = {
  brand: { primary: '#0F766E', secondary: '#4F46E5', accent: '#34D399' },
  fonts: { heading: 'Poppins', body: 'Inter' },
};

const PreviewThemeContext = createContext<PreviewThemeConfig>(DEFAULT_THEME);
export const PreviewThemeProvider = PreviewThemeContext.Provider;
export const usePreviewTheme = () => useContext(PreviewThemeContext);

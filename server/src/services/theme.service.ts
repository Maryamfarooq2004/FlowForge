import { Theme } from '../models/Theme.model';
import { Project } from '../models/Project.model';
import { AppError } from '../utils/AppError';
import { getThemePresets, getPresetsByDomain, getDefaultPreset } from '../config/themePresets';
import {
  ThemeColors,
  ThemeConfig,
  ThemeContrast,
  ThemePreset,
  ThemeResponse,
  ALLOWED_FONTS,
} from '../types/theme.types';
import { PreviewThemeConfig, DEFAULT_THEME } from '../types/preview.types';

const HEX = /^#[0-9a-fA-F]{6}$/;

// ── WCAG contrast (relative luminance, sRGB) ──────────────────────────────────

const linearize = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

/** WCAG contrast ratio between two hex colors (1–21), rounded to 2 dp. */
export const contrastRatio = (hexA: string, hexB: string): number => {
  const la = luminance(hexA);
  const lb = luminance(hexB);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  return Math.round(ratio * 100) / 100;
};

/** Legibility of white text on the primary color (button text). */
export const wcagFor = (colors: ThemeColors): ThemeContrast => {
  const primaryOnWhite = contrastRatio(colors.primary, '#FFFFFF');
  return { primaryOnWhite, passesAA: primaryOnWhite >= 4.5 };
};

// ── Validation ────────────────────────────────────────────────────────────────

const assertHex = (label: string, value: unknown): string => {
  if (typeof value !== 'string' || !HEX.test(value)) {
    throw new AppError(`${label} must be a hex color like #0F766E.`, 400, 'VALIDATION_ERROR');
  }
  return value;
};

const assertFont = (label: string, value: unknown): string => {
  if (typeof value !== 'string' || !(ALLOWED_FONTS as readonly string[]).includes(value)) {
    throw new AppError(`${label} must be one of: ${ALLOWED_FONTS.join(', ')}.`, 400, 'VALIDATION_ERROR');
  }
  return value;
};

const assertProject = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

const withContrast = (config: ThemeConfig): ThemeResponse => ({ ...config, contrast: wcagFor(config.colors) });

const presetToConfig = (preset: ThemePreset): ThemeConfig => ({
  colors: preset.colors,
  fonts: preset.fonts,
  presetKey: preset.key,
});

// ── Public service functions ────────────────────────────────────────────────

/** All presets (optionally filtered by domain). */
export const getPresetsService = (domain?: 'clinic' | 'school'): ThemePreset[] =>
  domain ? getPresetsByDomain(domain) : getThemePresets();

/** Saved theme for a project, or the domain's default preset if none saved. */
export const getProjectThemeService = async (userId: string, projectId: string): Promise<ThemeResponse> => {
  const project = await assertProject(userId, projectId);
  const saved = await Theme.findOne({ projectId, userId }).lean();
  if (saved) {
    return withContrast({ colors: saved.colors, fonts: saved.fonts, presetKey: saved.presetKey });
  }
  return withContrast(presetToConfig(getDefaultPreset(project.domain)));
};

/** Validate + upsert a project's theme. */
export const saveProjectThemeService = async (
  userId: string,
  projectId: string,
  input: any
): Promise<ThemeResponse> => {
  await assertProject(userId, projectId);
  const colors: ThemeColors = {
    primary: assertHex('Primary color', input?.colors?.primary),
    secondary: assertHex('Secondary color', input?.colors?.secondary),
    accent: assertHex('Accent color', input?.colors?.accent),
  };
  const fonts = {
    heading: assertFont('Heading font', input?.fonts?.heading),
    body: assertFont('Body font', input?.fonts?.body),
  };
  const presetKey = typeof input?.presetKey === 'string' ? input.presetKey : undefined;

  await Theme.findOneAndUpdate(
    { projectId, userId },
    { $set: { colors, fonts, presetKey } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Non-disruptive progress marker (theme is not a blocking pipeline gate).
  await Project.findByIdAndUpdate(projectId, {
    $addToSet: { 'progress.completedSteps': 'theme' },
  });

  return withContrast({ colors, fonts, presetKey });
};

/**
 * The theme projected for the live Preview (`PreviewThemeConfig`). Resilient —
 * never throws; falls back to the domain default, then the brand palette.
 */
export const getPreviewTheme = async (
  userId: string,
  projectId: string,
  domain: 'clinic' | 'school'
): Promise<PreviewThemeConfig> => {
  try {
    const saved = await Theme.findOne({ projectId, userId }).lean();
    const source = saved ?? getDefaultPreset(domain);
    return { brand: source.colors, fonts: source.fonts };
  } catch {
    return DEFAULT_THEME;
  }
};

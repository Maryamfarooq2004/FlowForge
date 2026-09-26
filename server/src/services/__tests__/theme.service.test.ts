// Mock the Mongoose models (no live DB; repo convention).
jest.mock('../../models/Theme.model', () => ({
  Theme: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));
jest.mock('../../models/Project.model', () => ({
  Project: { findOne: jest.fn(), findByIdAndUpdate: jest.fn() },
}));

import {
  contrastRatio,
  wcagFor,
  getPresetsService,
  getProjectThemeService,
  saveProjectThemeService,
  getPreviewTheme,
} from '../theme.service';
import { THEME_PRESETS } from '../../config/themePresets';
import { ALLOWED_FONTS } from '../../types/theme.types';
import { DEFAULT_THEME } from '../../types/preview.types';
import { Theme } from '../../models/Theme.model';
import { Project } from '../../models/Project.model';

const themeFindOne = Theme.findOne as jest.Mock;
const themeUpsert = Theme.findOneAndUpdate as jest.Mock;
const projectFindOne = Project.findOne as jest.Mock;
const projectUpdate = Project.findByIdAndUpdate as jest.Mock;

const HEX = /^#[0-9a-fA-F]{6}$/;
const leanOf = (v: unknown) => ({ lean: () => Promise.resolve(v) });

beforeEach(() => {
  jest.clearAllMocks();
  themeUpsert.mockResolvedValue({});
  projectUpdate.mockResolvedValue({});
});

describe('theme presets', () => {
  it('ships ≥12 presets with ≥6 per domain', () => {
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(12);
    expect(THEME_PRESETS.filter((p) => p.domain === 'clinic').length).toBeGreaterThanOrEqual(6);
    expect(THEME_PRESETS.filter((p) => p.domain === 'school').length).toBeGreaterThanOrEqual(6);
  });

  it('has unique keys, valid hex colors, and allow-listed fonts', () => {
    const keys = THEME_PRESETS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of THEME_PRESETS) {
      expect(p.colors.primary).toMatch(HEX);
      expect(p.colors.secondary).toMatch(HEX);
      expect(p.colors.accent).toMatch(HEX);
      expect(ALLOWED_FONTS).toContain(p.fonts.heading as any);
      expect(ALLOWED_FONTS).toContain(p.fonts.body as any);
    }
  });

  it('filters by domain', () => {
    expect(getPresetsService('clinic').every((p) => p.domain === 'clinic')).toBe(true);
    expect(getPresetsService('school').every((p) => p.domain === 'school')).toBe(true);
    expect(getPresetsService().length).toBe(THEME_PRESETS.length);
  });
});

describe('contrastRatio / wcagFor', () => {
  it('computes known ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 2);
    // Symmetric.
    expect(contrastRatio('#0F766E', '#FFFFFF')).toBe(contrastRatio('#FFFFFF', '#0F766E'));
  });

  it('passes AA for a dark primary and fails for a light one', () => {
    expect(wcagFor({ primary: '#000000', secondary: '#000000', accent: '#000000' }).passesAA).toBe(true);
    const light = wcagFor({ primary: '#FDE047', secondary: '#000000', accent: '#000000' });
    expect(light.passesAA).toBe(false);
    expect(light.primaryOnWhite).toBeLessThan(4.5);
  });
});

describe('getProjectThemeService', () => {
  it('returns the saved theme with a contrast result', async () => {
    projectFindOne.mockResolvedValue({ domain: 'clinic' });
    themeFindOne.mockReturnValue(
      leanOf({ colors: { primary: '#123456', secondary: '#654321', accent: '#abcdef' }, fonts: { heading: 'Poppins', body: 'Inter' }, presetKey: 'custom' })
    );
    const theme = await getProjectThemeService('u1', 'p1');
    expect(theme.colors.primary).toBe('#123456');
    expect(theme.presetKey).toBe('custom');
    expect(theme.contrast).toHaveProperty('passesAA');
  });

  it('falls back to the domain default preset when none is saved', async () => {
    projectFindOne.mockResolvedValue({ domain: 'school' });
    themeFindOne.mockReturnValue(leanOf(null));
    const theme = await getProjectThemeService('u1', 'p1');
    expect(THEME_PRESETS.find((p) => p.key === theme.presetKey)?.domain).toBe('school');
  });
});

describe('saveProjectThemeService', () => {
  const good = {
    colors: { primary: '#0F766E', secondary: '#4F46E5', accent: '#34D399' },
    fonts: { heading: 'Poppins', body: 'Inter' },
    presetKey: 'clinic-teal',
  };

  it('validates + upserts a good theme and returns contrast', async () => {
    projectFindOne.mockResolvedValue({ domain: 'clinic' });
    const theme = await saveProjectThemeService('u1', 'p1', good);
    expect(themeUpsert).toHaveBeenCalledTimes(1);
    expect(theme.colors.primary).toBe('#0F766E');
    expect(theme.contrast.primaryOnWhite).toBeGreaterThan(1);
    // Marks the 'theme' step complete (non-disruptive).
    expect(projectUpdate).toHaveBeenCalled();
  });

  it('rejects a bad hex color', async () => {
    projectFindOne.mockResolvedValue({ domain: 'clinic' });
    await expect(
      saveProjectThemeService('u1', 'p1', { ...good, colors: { ...good.colors, primary: 'teal' } })
    ).rejects.toThrow(/hex color/i);
    expect(themeUpsert).not.toHaveBeenCalled();
  });

  it('rejects a font outside the allow-list', async () => {
    projectFindOne.mockResolvedValue({ domain: 'clinic' });
    await expect(
      saveProjectThemeService('u1', 'p1', { ...good, fonts: { heading: 'Comic Sans', body: 'Inter' } })
    ).rejects.toThrow(/must be one of/i);
  });
});

describe('getPreviewTheme', () => {
  it('projects the saved theme to a PreviewThemeConfig (brand + fonts)', async () => {
    themeFindOne.mockReturnValue(
      leanOf({ colors: { primary: '#111111', secondary: '#222222', accent: '#333333' }, fonts: { heading: 'Outfit', body: 'Roboto' } })
    );
    const t = await getPreviewTheme('u1', 'p1', 'clinic');
    expect(t.brand.primary).toBe('#111111');
    expect(t.fonts.heading).toBe('Outfit');
  });

  it('falls back to the domain default when unset', async () => {
    themeFindOne.mockReturnValue(leanOf(null));
    const t = await getPreviewTheme('u1', 'p1', 'school');
    const def = THEME_PRESETS.find((p) => p.domain === 'school')!;
    expect(t.brand.primary).toBe(def.colors.primary);
  });

  it('never throws — returns DEFAULT_THEME on a DB error', async () => {
    themeFindOne.mockImplementation(() => { throw new Error('mongo down'); });
    const t = await getPreviewTheme('u1', 'p1', 'clinic');
    expect(t).toEqual(DEFAULT_THEME);
  });
});

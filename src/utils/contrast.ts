/** WCAG contrast helpers (client-side, mirrors server/src/services/theme.service.ts). */

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

/** Contrast ratio between two hex colors (1–21). Returns 1 for malformed input. */
export const contrastRatio = (hexA: string, hexB: string): number => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hexA) || !/^#[0-9a-fA-F]{6}$/.test(hexB)) return 1;
  const la = luminance(hexA);
  const lb = luminance(hexB);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  return Math.round(ratio * 100) / 100;
};

/** WCAG-AA for white text on the given color (normal text ≥ 4.5). */
export const passesAA = (color: string): boolean => contrastRatio(color, '#FFFFFF') >= 4.5;

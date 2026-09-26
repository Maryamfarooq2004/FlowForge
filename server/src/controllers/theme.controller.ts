import { Request, Response, NextFunction } from 'express';
import * as ts from '../services/theme.service';

const uid = (req: Request) => (req as any).userId as string;
const pid = (req: Request) => String(req.params.projectId);

/** GET /themes/presets?domain=clinic|school — the preset gallery. */
export const getPresets = (req: Request, res: Response, next: NextFunction) => {
  try {
    const domain = req.query.domain === 'clinic' || req.query.domain === 'school' ? req.query.domain : undefined;
    const presets = ts.getPresetsService(domain as 'clinic' | 'school' | undefined);
    res.json({ success: true, data: { presets } });
  } catch (e) {
    next(e);
  }
};

/** GET /themes/:projectId — the saved theme (or domain default) + WCAG. */
export const getTheme = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theme = await ts.getProjectThemeService(uid(req), pid(req));
    res.json({ success: true, data: { theme } });
  } catch (e) {
    next(e);
  }
};

/** PUT /themes/:projectId — save the project's theme. */
export const saveTheme = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theme = await ts.saveProjectThemeService(uid(req), pid(req), req.body);
    res.json({ success: true, data: { theme } });
  } catch (e) {
    next(e);
  }
};

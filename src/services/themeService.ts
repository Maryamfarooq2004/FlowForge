import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { ThemePreset, ThemeConfig, ThemeResponse } from '../types/theme.types';

type PresetsResponse = ApiResponse<{ presets: ThemePreset[] }>;
type ThemeResp = ApiResponse<{ theme: ThemeResponse }>;

const themeService = {
  getPresets: (domain?: 'clinic' | 'school') =>
    axiosInstance.get<PresetsResponse>('/themes/presets', { params: domain ? { domain } : undefined }),

  getTheme: (projectId: string) => axiosInstance.get<ThemeResp>(`/themes/${projectId}`),

  saveTheme: (projectId: string, config: ThemeConfig) =>
    axiosInstance.put<ThemeResp>(`/themes/${projectId}`, config),
};

export default themeService;

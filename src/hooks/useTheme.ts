import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import themeService from '../services/themeService';
import type { ThemeConfig, ThemeResponse } from '../types/theme.types';
import type { ApiError } from '../types/global.types';

const presetsKey = (domain?: string) => ['themes', 'presets', domain ?? 'all'];
const themeKey = (projectId?: string) => ['themes', projectId];

export const useThemePresets = (domain?: 'clinic' | 'school') =>
  useQuery({
    queryKey: presetsKey(domain),
    queryFn: () => themeService.getPresets(domain).then((r) => r.data.data!.presets),
    staleTime: Infinity,
  });

export const useProjectTheme = (projectId?: string) =>
  useQuery<ThemeResponse>({
    queryKey: themeKey(projectId),
    queryFn: () => themeService.getTheme(projectId!).then((r) => r.data.data!.theme),
    enabled: !!projectId,
    retry: false,
  });

export const useSaveTheme = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: ThemeConfig) => themeService.saveTheme(projectId!, config),
    onSuccess: (res) => {
      qc.setQueryData(themeKey(projectId), res.data.data!.theme);
      toast.success('Theme saved.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not save the theme.');
    },
  });
};

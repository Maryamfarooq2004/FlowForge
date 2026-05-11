import { useQuery, useMutation } from '@tanstack/react-query';
import intakeService from '../services/intakeService';
import type { IntakeBundle } from '../types/intake.types';

export const intakeKeys = {
  all:    (projectId: string) => ['intake', projectId] as const,
  bundle: (projectId: string) => [...intakeKeys.all(projectId), 'bundle'] as const,
};

// Load existing intake data (for prefilling on resume)
export const useIntakeBundle = (projectId: string | undefined) =>
  useQuery({
    queryKey: intakeKeys.bundle(projectId!),
    queryFn: async () => {
      const res = await intakeService.getIntakeBundle(projectId!);
      return res.data.data?.bundle as IntakeBundle;
    },
    enabled: !!projectId,
    staleTime: 0, // Always reload intake data fresh
  });

// Save guided screen to MongoDB
export const useSaveGuidedScreen = (projectId: string) => {
  return useMutation({
    mutationFn: (data: {
      screenNumber: 1 | 2 | 3 | 4;
      content: string;
      detectedItems: string[];
      confirmedItems: string[];
    }) => intakeService.saveGuidedScreen(projectId, data.screenNumber, {
      content: data.content,
      detectedItems: data.detectedItems,
      confirmedItems: data.confirmedItems,
    }),
    // No toast — this happens silently when user clicks Next
  });
};

// Auto-save (background, no navigation)
export const useAutoSaveScreen = (projectId: string) => {
  return useMutation({
    mutationFn: (data: { screenNumber: 1|2|3|4; content: string }) =>
      intakeService.autoSaveScreen(projectId, data.screenNumber, data.content),
  });
};

// Save structured form
export const useSaveStructuredForm = (projectId: string) => {
  return useMutation({
    mutationFn: (formData: Record<string, any>) =>
      intakeService.saveStructuredForm(projectId, formData),
  });
};

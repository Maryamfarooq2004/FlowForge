import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { IntakeBundle } from '../types/intake.types';

const intakeService = {
  // Load existing intake data to prefill forms
  getIntakeBundle: (projectId: string) =>
    axiosInstance.get<ApiResponse<{ bundle: IntakeBundle }>>(
      `/projects/${projectId}/intake`
    ),

  // Save structured form (close-ended step)
  saveStructuredForm: (projectId: string, formData: Record<string, any>) =>
    axiosInstance.post<ApiResponse<{ bundle: IntakeBundle }>>(
      `/projects/${projectId}/intake/form`,
      { formData }
    ),

  // Save guided screen — called BEFORE navigating to next screen
  saveGuidedScreen: (
    projectId: string,
    screenNumber: 1 | 2 | 3 | 4,
    data: {
      content: string;
      detectedItems: string[];
      confirmedItems: string[];
    }
  ) =>
    axiosInstance.patch<ApiResponse<{ bundle: IntakeBundle }>>(
      `/projects/${projectId}/intake/screen/${screenNumber}`,
      data
    ),

  // Auto-save without advancing progress
  autoSaveScreen: (projectId: string, screenNumber: 1|2|3|4, content: string) =>
    axiosInstance.patch(
      `/projects/${projectId}/intake/screen/${screenNumber}/autosave`,
      { content }
    ),

  // Get domain-specific questions
  getQuestions: (category: 'clinic' | 'school') =>
    axiosInstance.get(`/intake/questions?category=${category}`).then(res => res.data.data),

  // Get AI-powered suggestions
  getSuggestions: (content: string, screenSlug: string, domain: string) =>
    axiosInstance.post<ApiResponse<{ suggestions: string[] }>>('/ai/suggestions', {
      content,
      screenSlug,
      domain,
    }).then(res => res.data.data),

  // Assemble the final bundle — builds the AI blueprint draft
  assembleBundle: (projectId: string) =>
    axiosInstance.post<ApiResponse<{ bundle: IntakeBundle }>>(
      `/projects/${projectId}/intake/assemble`
    ).then(res => res.data.data.bundle),
};

export default intakeService;

import axiosInstance from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { IntakeBundle } from '../types/intake.types';

export interface IntakeQuestion {
  id: string;
  section: string;
  question: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  yesLabel?: string;
  noLabel?: string;
}

export interface SaveFormResult {
  bundle: IntakeBundle;
  complete: boolean;
  missingRequired: string[];
}

export interface IntakeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const intakeService = {
  // Load existing intake data to prefill forms
  getIntakeBundle: (projectId: string) =>
    axiosInstance.get<ApiResponse<{ bundle: IntakeBundle }>>(
      `/projects/${projectId}/intake`
    ),

  // Save structured form (close-ended step) → { bundle, complete, missingRequired }
  saveStructuredForm: (projectId: string, formData: Record<string, any>) =>
    axiosInstance
      .post<ApiResponse<SaveFormResult>>(`/projects/${projectId}/intake/form`, { formData })
      .then((res) => res.data.data as SaveFormResult),

  // Save guided screen — called BEFORE navigating to next screen
  saveGuidedScreen: (
    projectId: string,
    screenNumber: 1 | 2 | 3 | 4,
    data: { content: string; detectedItems: string[]; confirmedItems: string[] }
  ) =>
    axiosInstance.patch<ApiResponse<{ bundle: IntakeBundle }>>(
      `/projects/${projectId}/intake/screen/${screenNumber}`,
      data
    ),

  // Auto-save without advancing progress
  autoSaveScreen: (projectId: string, screenNumber: 1 | 2 | 3 | 4, content: string) =>
    axiosInstance.patch(
      `/projects/${projectId}/intake/screen/${screenNumber}/autosave`,
      { content }
    ),

  // Get domain-specific questions
  getQuestions: (category: 'clinic' | 'school') =>
    axiosInstance
      .get<ApiResponse<IntakeQuestion[]>>(`/intake/questions?category=${category}`)
      .then((res) => res.data.data as IntakeQuestion[]),

  // AI-powered suggestions (button-triggered; empty content → guidance mode)
  getSuggestions: (content: string, screenSlug: string, domain: string) =>
    axiosInstance
      .post<ApiResponse<{ suggestions: string[] }>>('/ai/suggestions', {
        content,
        screenSlug,
        domain,
      })
      .then((res) => res.data.data?.suggestions ?? []),

  // FE2.11 pre-check (does not assemble) → { valid, errors, warnings }
  validateIntake: (projectId: string) =>
    axiosInstance
      .post<ApiResponse<IntakeValidationResult>>(`/projects/${projectId}/intake/validate`)
      .then((res) => res.data.data as IntakeValidationResult),

  // Assemble the final bundle → { bundle, warnings }. A 422 (validation failure)
  // rejects, carrying { errors, warnings } on error.response.data.
  assembleBundle: (projectId: string) =>
    axiosInstance
      .post<ApiResponse<{ bundle: IntakeBundle; warnings: string[] }>>(
        `/projects/${projectId}/intake/assemble`
      )
      .then((res) => res.data.data as { bundle: IntakeBundle; warnings: string[] }),
};

export default intakeService;

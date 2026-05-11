import axiosInstance from '../lib/axios';

export interface Question {
  id: string;
  section: string;
  question: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  yesLabel?: string;
  noLabel?: string;
  order?: number;
}

export interface IntakeBundleResponse {
  exists?: boolean;
  projectId?: string;
  structuredForm?: Record<string, unknown>;
  screen1WorkflowStory?: string;
  screen2PeopleRoles?: string;
  screen3DataTracking?: string;
  screen4RulesExceptions?: string;
  completedScreens?: number[];
  bundleJson?: Record<string, unknown> | null;
  bundleVersion?: number;
  validationErrors?: string[];
  isValidated?: boolean;
  status?: string;
}

export interface ScreenSaveResponse {
  screenNumber: number;
  saved: boolean;
  characterCount: number;
  completedScreens: number[];
}

export interface AssembleResponse {
  bundle: Record<string, unknown>;
  bundleVersion: number;
  validationErrors: string[];
  isValidated: boolean;
}

// ── GET questions by category ─────────────────────────────────────────────────
const getQuestions = async (category: 'clinic' | 'school'): Promise<Question[]> => {
  const response = await axiosInstance.get(`/intake/questions?category=${category}`);
  return response.data.data;
};

// ── POST /intake/:projectId/form ─────────────────────────────────────────────
// Submit the close-ended structured form data
const submitForm = async (
  projectId: string,
  formData: Record<string, unknown>
): Promise<{ saved: boolean; savedAt: string; structuredForm: Record<string, unknown> }> => {
  const response = await axiosInstance.post(`/intake/${projectId}/form`, formData);
  return response.data.data;
};

// ── GET /intake/:projectId ────────────────────────────────────────────────────
// Retrieve the full intake bundle (used for resuming sessions)
const getIntake = async (projectId: string): Promise<IntakeBundleResponse> => {
  const response = await axiosInstance.get(`/intake/${projectId}`);
  return response.data.data;
};

// ── PATCH /intake/:projectId/screen/:screenNumber ────────────────────────────
// Save text for one guided screen
const saveScreen = async (
  projectId: string,
  screenNumber: 1 | 2 | 3 | 4,
  text: string
): Promise<ScreenSaveResponse> => {
  const response = await axiosInstance.patch(
    `/intake/${projectId}/screen/${screenNumber}`,
    { text }
  );
  return response.data.data;
};

// ── POST /intake/:projectId/assemble ─────────────────────────────────────────
// Trigger bundle assembly and validation
const assembleBundle = async (projectId: string): Promise<AssembleResponse> => {
  const response = await axiosInstance.post(`/intake/${projectId}/assemble`);
  return response.data.data;
};

// Legacy alias kept for backward-compat with existing CloseEndedForm component
// (it used saveIntakeForm → PATCH /intake/:projectId/form, now mapped to submitForm via POST)
const saveIntakeForm = async (projectId: string, data: Record<string, unknown>) => {
  return submitForm(projectId, data);
};

export default {
  getQuestions,
  submitForm,
  getIntake,
  saveScreen,
  assembleBundle,
  // legacy alias
  saveIntakeForm,
};

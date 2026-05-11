export interface GuidedScreenData {
  screen: 1 | 2 | 3 | 4;
  content: string;
  detectedItems: string[];
  confirmedItems: string[];
  isComplete: boolean;
  savedAt: string;
}

export interface IntakeBundle {
  id: string;
  projectId: string;
  userId: string;
  domain: 'clinic' | 'school';
  structuredFormData: Record<string, any>;
  structuredFormComplete: boolean;
  guidedScreens: GuidedScreenData[];
  assembledBundle: Record<string, any> | null;
  isAssembled: boolean;
  assembledAt?: string;
  validationErrors: string[];
  validationWarnings: string[];
  createdAt: string;
  updatedAt: string;
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface DataField {
  id: string;
  name: string;
  type: string;
}

interface BusinessRule {
  id: string;
  description: string;
}

interface IntakeStore {
  projectId: string | null;
  domain: 'clinic' | 'school' | null;
  workflowStory: string;
  roles: Role[];
  dataFields: DataField[];
  businessRules: BusinessRule[];
  currentStep: 1 | 2 | 3 | 4;
  isComplete: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setDomain: (domain: 'clinic' | 'school') => void;
  updateStep: (step: 1 | 2 | 3 | 4, data: any) => void;
  resetIntake: () => void;
}

export const useIntakeStore = create<IntakeStore>()(
  persist(
    (set) => ({
      projectId: null,
      domain: null,
      workflowStory: '',
      roles: [],
      dataFields: [],
      businessRules: [],
      currentStep: 1,
      isComplete: false,
      autoSaveStatus: 'idle',
      setDomain: (domain) => set({ domain }),
      updateStep: (step, data) => set((state) => ({ ...state, currentStep: step, ...data })),
      resetIntake: () => set({
        projectId: null,
        domain: null,
        workflowStory: '',
        roles: [],
        dataFields: [],
        businessRules: [],
        currentStep: 1,
        isComplete: false,
      }),
    }),
    {
      name: 'intake-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

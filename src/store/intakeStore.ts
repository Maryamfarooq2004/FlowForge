/**
 * intakeStore.ts
 *
 * Zustand store for the Workflow Intake Engine (Module 2).
 *
 * Autosave design:
 *   - Uses a useRef timer pattern (debounce) — NOT a useEffect dependency on text
 *   - Debounce delay: 1000ms — rapid typing does NOT spam the API
 *   - saveScreen() is called from components via the store action
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import intakeService from '../services/intakeService';

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type ScreenNumber = 1 | 2 | 3 | 4;

interface IntakeStore {
  // Identity
  projectId: string | null;
  domain: 'clinic' | 'school' | null;

  // Guided screens text
  screen1WorkflowStory: string;
  screen2PeopleRoles: string;
  screen3DataTracking: string;
  screen4RulesExceptions: string;

  // Screen tracking
  completedScreens: number[];
  currentStep: ScreenNumber;

  // Assembled bundle
  bundleJson: Record<string, unknown> | null;
  validationErrors: string[];
  isValidated: boolean;

  // UX state
  autoSaveStatus: AutoSaveStatus;
  isComplete: boolean;

  // Actions
  setProjectId: (projectId: string) => void;
  setDomain: (domain: 'clinic' | 'school') => void;
  setCurrentStep: (step: ScreenNumber) => void;
  setScreenText: (screen: ScreenNumber, text: string) => void;
  markScreenComplete: (screen: ScreenNumber) => void;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
  setBundleResult: (result: {
    bundleJson: Record<string, unknown>;
    validationErrors: string[];
    isValidated: boolean;
  }) => void;
  resetIntake: () => void;

  /**
   * Save a single screen to the API.
   * Call this from the component's debounced ref-timer — not directly from onChange.
   */
  saveScreen: (
    projectId: string,
    screen: ScreenNumber,
    text: string
  ) => Promise<void>;
}

const DEFAULT_STATE = {
  projectId: null,
  domain: null,
  screen1WorkflowStory: '',
  screen2PeopleRoles: '',
  screen3DataTracking: '',
  screen4RulesExceptions: '',
  completedScreens: [] as number[],
  currentStep: 1 as ScreenNumber,
  bundleJson: null,
  validationErrors: [] as string[],
  isValidated: false,
  autoSaveStatus: 'idle' as AutoSaveStatus,
  isComplete: false,
};

export const useIntakeStore = create<IntakeStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setProjectId: (projectId) => set({ projectId }),

      setDomain: (domain) => set({ domain }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setScreenText: (screen, text) => {
        const fieldMap: Record<ScreenNumber, keyof IntakeStore> = {
          1: 'screen1WorkflowStory',
          2: 'screen2PeopleRoles',
          3: 'screen3DataTracking',
          4: 'screen4RulesExceptions',
        };
        set({ [fieldMap[screen]]: text });
      },

      markScreenComplete: (screen) =>
        set((state) => ({
          completedScreens: state.completedScreens.includes(screen)
            ? state.completedScreens
            : [...state.completedScreens, screen],
          isComplete: [...state.completedScreens, screen].length === 4,
        })),

      setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),

      setBundleResult: ({ bundleJson, validationErrors, isValidated }) =>
        set({ bundleJson, validationErrors, isValidated }),

      /**
       * saveScreen — calls the API to persist one screen's text.
       * The component MUST debounce calls to this (1000ms) via useRef.
       */
      saveScreen: async (projectId, screen, text) => {
        set({ autoSaveStatus: 'saving' });
        try {
          const result = await intakeService.saveScreen(projectId, screen, text);
          // Sync completedScreens from server response
          set({
            autoSaveStatus: 'saved',
            completedScreens: result.completedScreens,
            isComplete: result.completedScreens.length === 4,
          });
        } catch (err) {
          console.error('[IntakeStore] saveScreen error:', err);
          set({ autoSaveStatus: 'error' });
        }
      },

      resetIntake: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'intake-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist lightweight fields — not bundleJson (can be large)
      partialize: (state) => ({
        projectId: state.projectId,
        domain: state.domain,
        currentStep: state.currentStep,
        completedScreens: state.completedScreens,
        screen1WorkflowStory: state.screen1WorkflowStory,
        screen2PeopleRoles: state.screen2PeopleRoles,
        screen3DataTracking: state.screen3DataTracking,
        screen4RulesExceptions: state.screen4RulesExceptions,
      }),
    }
  )
);

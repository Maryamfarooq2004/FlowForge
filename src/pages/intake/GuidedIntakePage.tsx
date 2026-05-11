import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useIntakeBundle, useSaveGuidedScreen, useAutoSaveScreen } from '../../hooks/useIntake';
import { useProject } from '../../hooks/useProjects';
import { AISuggestions } from '../../components/intake/AISuggestions';

// Screen number comes from the route
// /project/:projectId/intake/story  → screen 1
// /project/:projectId/intake/roles  → screen 2
// /project/:projectId/intake/data   → screen 3
// /project/:projectId/intake/rules  → screen 4

const SCREEN_MAP: Record<string, 1 | 2 | 3 | 4> = {
  story: 1,
  roles: 2,
  data:  3,
  rules: 4,
};

const NEXT_ROUTE_MAP: Record<number, string> = {
  1: 'roles',
  2: 'data',
  3: 'rules',
  4: 'review',
};

interface GuidedIntakePageProps {
  screenSlug: 'story' | 'roles' | 'data' | 'rules';
}

export default function GuidedIntakePage({ screenSlug }: GuidedIntakePageProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const screenNumber = SCREEN_MAP[screenSlug];

  const [content, setContent] = useState('');
  const [confirmedItems, setConfirmedItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load existing intake data from MongoDB (for resume)
  const { data: bundle, isLoading: loadingBundle } = useIntakeBundle(projectId);
  const { data: project } = useProject(projectId);

  // Mutations
  const { mutateAsync: saveScreen } = useSaveGuidedScreen(projectId!);
  const { mutate: autoSave } = useAutoSaveScreen(projectId!);

  // ── PREFILL FORM FROM DATABASE ON LOAD ──────────────────────
  // This is what enables resume — existing data comes from MongoDB
  // Always reset content when switching screens to prevent text leaking
  useEffect(() => {
    if (!bundle) {
      setContent('');
      setConfirmedItems([]);
      return;
    }
    const screenData = bundle.guidedScreens.find(s => s.screen === screenNumber);
    setContent(screenData?.content || '');
    setConfirmedItems(screenData?.confirmedItems || []);
  }, [bundle, screenNumber]);

  // ── AUTO-SAVE EVERY 60 SECONDS ───────────────────────────────
  useEffect(() => {
    if (!projectId || !content.trim()) return;

    autoSaveTimerRef.current = setInterval(() => {
      autoSave({ screenNumber, content });
    }, 60000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [content, screenNumber, projectId]);

  // ── HANDLE NEXT — SAVES TO DB BEFORE NAVIGATION ─────────────
  const handleNext = async () => {
    if (!projectId) return;

    if (content.trim().length < 50) {
      toast.error('Please provide more detail before continuing.');
      return;
    }

    setIsSaving(true);
    try {
      // Save to MongoDB FIRST — navigation only happens on success
      await saveScreen({
        screenNumber,
        content: content.trim(),
        detectedItems: detectItems(content, screenSlug),
        confirmedItems,
      });

      // Only navigate after successful save
      const nextSlug = NEXT_ROUTE_MAP[screenNumber];
      if (nextSlug === 'review') {
        navigate(`/project/${projectId}/intake/review`);
      } else {
        navigate(`/project/${projectId}/intake/${nextSlug}`);
      }
    } catch (err: any) {
      // Do NOT navigate if save failed
      toast.error(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Simple keyword detection based on screen type
  const detectItems = (text: string, screen: string): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    if (screen === 'roles') {
      const roleKeywords = [
        'receptionist', 'doctor', 'nurse', 'manager', 'cashier',
        'admin', 'teacher', 'principal', 'officer', 'staff',
        'student', 'parent', 'customer', 'client', 'agent',
        'technician', 'engineer', 'supervisor', 'director'
      ];
      return roleKeywords.filter(r => words.some(w => w.includes(r)));
    }
    return [];
  };

  if (loadingBundle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent 
                        rounded-full animate-spin" />
      </div>
    );
  }

  const screenTitles: Record<string, string> = {
    story: 'Tell us your full workflow story',
    roles: 'Who is involved in your workflow?',
    data:  'What information do you record?',
    rules: 'What are your rules and special conditions?',
  };

  const screenSubtitles: Record<string, string> = {
    story: `Walk us through your ${project?.domain || 'business'} process from start to finish.`,
    roles: `Describe everyone who plays a part in the ${project?.domain || 'business'} workflow.`,
    data:  `Think of your ${project?.domain === 'clinic' ? 'register' : 'enrollment files'} or Excel — what do you write down?`,
    rules: `Describe your ${project?.domain || 'business'} policies as you would to a new employee.`,
  };

  const placeholders: Record<string, string> = {
    story: project?.domain === 'clinic'
      ? 'A patient calls to book an appointment. The receptionist checks the calendar...'
      : 'A student submits an application form. The admission officer reviews it...',
    roles: project?.domain === 'clinic'
      ? 'Our receptionist handles booking. The doctor reviews the patient history...'
      : 'The admission officer screens applications. The principal makes final decisions...',
    data: project?.domain === 'clinic'
      ? 'Before visit: patient name, phone, appointment date. During: symptoms, diagnosis...'
      : 'Before admission: student name, test scores. During: interview notes, decisions...',
    rules: project?.domain === 'clinic'
      ? 'Patients with unpaid balances cannot book new appointments...'
      : 'Admission requires a test score above 60%. Fee must be paid before enrollment...',
  };

  const minChars = 50;
  const charCount = content.trim().length;
  const progressPct = Math.min((charCount / 300) * 100, 100);
  const isReadyToNext = charCount >= minChars;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                            text-sm font-semibold transition-colors
              ${n < screenNumber
                ? 'bg-[#0F766E] text-white'
                : n === screenNumber
                ? 'bg-[#0F766E] text-white ring-4 ring-teal-100'
                : 'bg-slate-200 text-slate-500'}`}>
              {n < screenNumber ? '✓' : n}
            </div>
            {n < 4 && (
              <div className={`h-0.5 w-8 transition-colors
                ${n < screenNumber ? 'bg-[#0F766E]' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-slate-500 font-medium">
          Step {screenNumber} of 4
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-poppins mb-1">
          {screenTitles[screenSlug]}
        </h1>
        <p className="text-slate-500 text-sm">{screenSubtitles[screenSlug]}</p>
      </div>

      {/* Textarea — prefilled from MongoDB on resume */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholders[screenSlug]}
          rows={10}
          className="w-full rounded-xl border border-slate-200 p-5 text-slate-700 
                     text-sm resize-none outline-none transition-all
                     focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100
                     placeholder:text-slate-400"
        />

        <AISuggestions
          content={content}
          screenSlug={screenSlug}
          domain={project?.domain || 'business'}
          onSelectSuggestion={(suggestion) => {
            const trimmed = content.trim();
            const suffix = trimmed.length > 0 ? (trimmed.endsWith('.') ? ' ' : '. ') : '';
            setContent(trimmed + suffix + suggestion + '. ');
          }}
        />

        {/* Progress bar */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {charCount} characters
            {charCount < minChars && ` (${minChars - charCount} more needed)`}
          </span>
          <span className={`text-xs font-medium ${isReadyToNext ? 'text-[#0F766E]' : 'text-slate-400'}`}>
            {isReadyToNext ? '✓ Ready to continue' : `${Math.round(progressPct)}% complete`}
          </span>
        </div>
        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F766E] rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => {
            // Go back without saving — data is auto-saved
            const prevMap: Record<number, string> = {
              1: `/project/${projectId}/intake/form`,
              2: `/project/${projectId}/intake/story`,
              3: `/project/${projectId}/intake/roles`,
              4: `/project/${projectId}/intake/data`,
            };
            navigate(prevMap[screenNumber]);
          }}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 
                     border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <span className="text-xs text-slate-400">
            ✓ Auto-saving
          </span>

          {/* Next button — saves to MongoDB before navigating */}
          <button
            onClick={handleNext}
            disabled={!isReadyToNext || isSaving}
            className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D6B63] 
                       disabled:bg-slate-300 disabled:cursor-not-allowed
                       text-white px-6 py-2.5 rounded-xl text-sm font-semibold 
                       transition-colors min-w-[140px] justify-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent 
                                rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              screenNumber === 4 ? 'Complete Intake →' : 'Next →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

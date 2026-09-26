import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Check, Loader2 } from 'lucide-react';
import { useIntakeBundle, useSaveGuidedScreen, useAutoSaveScreen } from '../../hooks/useIntake';
import { useProject } from '../../hooks/useProjects';
import { AISuggestions } from '../../components/intake/AISuggestions';

const SCREEN_MAP: Record<string, 1 | 2 | 3 | 4> = { story: 1, roles: 2, data: 3, rules: 4 };
const NEXT_ROUTE_MAP: Record<number, string> = { 1: 'roles', 2: 'data', 3: 'rules', 4: 'review' };

// Client-side candidate detection — mirrors the server so the user sees the same
// entities they can confirm. The server independently recomputes the authoritative
// `detectedItems`; the user's `confirmedItems` (below) are what feed generation.
const ROLE_WORDS: Record<string, string[]> = {
  clinic: ['receptionist', 'doctor', 'physician', 'nurse', 'billing', 'cashier', 'accountant', 'manager', 'admin', 'lab technician', 'pharmacist'],
  school: ['principal', 'class teacher', 'subject teacher', 'teacher', 'admission officer', 'finance', 'accountant', 'librarian', 'coordinator', 'admin', 'registrar', 'parent', 'student'],
};
const FIELD_WORDS = ['name', 'phone', 'contact', 'email', 'address', 'cnic', 'id', 'age', 'date of birth', 'date', 'gender', 'fee', 'payment', 'amount', 'balance', 'diagnosis', 'prescription', 'medicine', 'allergy', 'history', 'result', 'grade', 'marks', 'attendance', 'class', 'section', 'status', 'appointment'];
const RULE_SIGNALS = ['must', 'should', 'only', 'cannot', "can't", 'require', 'approval', 'approve', 'threshold', 'limit', 'deadline', 'overdue', 'late', 'block', 'not allowed', 'mandatory'];

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const uniqCI = (arr: string[]) => {
  const seen = new Set<string>(); const out: string[] = [];
  for (const x of arr) { const k = x.toLowerCase().trim(); if (k && !seen.has(k)) { seen.add(k); out.push(x.trim()); } }
  return out;
};

const detectCandidates = (screen: number, content: string, domain: string): string[] => {
  const text = (content || '').toLowerCase();
  if (!text.trim()) return [];
  const dom = domain === 'school' ? 'school' : 'clinic';
  if (screen === 2) return uniqCI(ROLE_WORDS[dom].filter((r) => text.includes(r)).map(titleCase)).slice(0, 15);
  if (screen === 3) return uniqCI(FIELD_WORDS.filter((f) => text.includes(f)).map(titleCase)).slice(0, 20);
  if (screen === 4) {
    const sentences = (content || '').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
    return uniqCI(sentences.filter((s) => RULE_SIGNALS.some((sig) => s.toLowerCase().includes(sig))).map((r) => r.slice(0, 140))).slice(0, 12);
  }
  return [];
};

const CHIP_LABEL: Record<number, string> = { 2: 'roles', 3: 'data fields', 4: 'rules' };

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const hydratedScreenRef = useRef<number | null>(null);

  const { data: bundle, isLoading: loadingBundle } = useIntakeBundle(projectId);
  const { data: project } = useProject(projectId);
  const domain = project?.domain || 'clinic';

  const { mutateAsync: saveScreen } = useSaveGuidedScreen(projectId!);
  const { mutate: autoSave } = useAutoSaveScreen(projectId!);

  // Hydrate from DB once per screen (do NOT clobber unsaved edits on background refetch).
  useEffect(() => {
    if (!bundle) return;
    if (hydratedScreenRef.current === screenNumber) return;
    const screenData = bundle.guidedScreens.find((s) => s.screen === screenNumber);
    setContent(screenData?.content || '');
    setConfirmedItems(screenData?.confirmedItems || []);
    lastSavedRef.current = screenData?.content || '';
    hydratedScreenRef.current = screenNumber;
    setSaveStatus('idle');
  }, [bundle, screenNumber]);

  // Debounced autosave — fires 2s AFTER the user stops typing (not reset mid-typing).
  useEffect(() => {
    if (!projectId) return;
    const trimmed = content.trim();
    if (trimmed.length < 10 || trimmed === lastSavedRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setSaveStatus('saving');
      autoSave(
        { screenNumber, content: trimmed },
        {
          onSuccess: () => { lastSavedRef.current = trimmed; setSaveStatus('saved'); },
          onError: () => setSaveStatus('idle'),
        }
      );
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [content, screenNumber, projectId]);

  // Detected candidates for the confirm chips (screens 2-4).
  const candidates = useMemo(
    () => detectCandidates(screenNumber, content, domain),
    [screenNumber, content, domain]
  );
  const toggleItem = (item: string) =>
    setConfirmedItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const handleNext = async () => {
    if (!projectId) return;
    if (content.trim().length < 50) {
      toast.error('Please provide more detail before continuing.');
      return;
    }
    setIsSaving(true);
    try {
      await saveScreen({
        screenNumber,
        content: content.trim(),
        detectedItems: candidates,
        // keep only confirmed items the user actually still has as candidates,
        // plus any they confirmed earlier that remain relevant
        confirmedItems: confirmedItems.filter((c) => candidates.includes(c)),
      });
      lastSavedRef.current = content.trim();
      const nextSlug = NEXT_ROUTE_MAP[screenNumber];
      navigate(`/project/${projectId}/intake/${nextSlug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingBundle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
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
    story: `Walk us through your ${domain} process from start to finish.`,
    roles: `Describe everyone who plays a part in the ${domain} workflow.`,
    data:  `Think of your ${domain === 'clinic' ? 'register' : 'enrollment files'} or Excel — what do you write down?`,
    rules: `Describe your ${domain} policies as you would to a new employee.`,
  };
  const placeholders: Record<string, string> = {
    story: domain === 'clinic'
      ? 'A patient calls to book an appointment. The receptionist checks the calendar...'
      : 'A student submits an application form. The admission officer reviews it...',
    roles: domain === 'clinic'
      ? 'Our receptionist handles booking. The doctor reviews the patient history...'
      : 'The admission officer screens applications. The principal makes final decisions...',
    data: domain === 'clinic'
      ? 'Before visit: patient name, phone, appointment date. During: symptoms, diagnosis...'
      : 'Before admission: student name, test scores. During: interview notes, decisions...',
    rules: domain === 'clinic'
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
              ${n < screenNumber ? 'bg-[#0F766E] text-white' : n === screenNumber ? 'bg-[#0F766E] text-white ring-4 ring-teal-100' : 'bg-slate-200 text-slate-500'}`}>
              {n < screenNumber ? '✓' : n}
            </div>
            {n < 4 && <div className={`h-0.5 w-8 transition-colors ${n < screenNumber ? 'bg-[#0F766E]' : 'bg-slate-200'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-slate-500 font-medium">Step {screenNumber} of 4</span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-poppins mb-1">{screenTitles[screenSlug]}</h1>
        <p className="text-slate-500 text-sm">{screenSubtitles[screenSlug]}</p>
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholders[screenSlug]}
          rows={10}
          className="w-full rounded-xl border border-slate-200 p-5 text-slate-700 text-sm resize-none outline-none transition-all
                     focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 placeholder:text-slate-400"
        />

        <AISuggestions
          key={screenSlug}
          content={content}
          screenSlug={screenSlug}
          domain={domain}
          onSelectSuggestion={(suggestion) => {
            const trimmed = content.trim();
            const suffix = trimmed.length > 0 ? (trimmed.endsWith('.') ? ' ' : '. ') : '';
            setContent(trimmed + suffix + suggestion + (suggestion.endsWith('.') ? ' ' : '. '));
          }}
        />

        {/* Detect → confirm chips (screens 2-4) */}
        {screenNumber !== 1 && candidates.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-600 mb-2">
              We detected these {CHIP_LABEL[screenNumber]} — tap the ones that are correct:
            </p>
            <div className="flex flex-wrap gap-2">
              {candidates.map((item) => {
                const confirmed = confirmedItems.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all
                      ${confirmed
                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#0F766E]'}`}
                  >
                    {confirmed && <Check size={12} />}
                    <span className="line-clamp-1 max-w-[240px]">{item}</span>
                  </button>
                );
              })}
            </div>
            {confirmedItems.filter((c) => candidates.includes(c)).length > 0 && (
              <p className="text-[10px] text-[#0F766E] mt-2 font-medium">
                {confirmedItems.filter((c) => candidates.includes(c)).length} confirmed
              </p>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {charCount} characters{charCount < minChars && ` (${minChars - charCount} more needed)`}
          </span>
          <span className={`text-xs font-medium ${isReadyToNext ? 'text-[#0F766E]' : 'text-slate-400'}`}>
            {isReadyToNext ? '✓ Ready to continue' : `${Math.round(progressPct)}% complete`}
          </span>
        </div>
        <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0F766E] rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => {
            const prevMap: Record<number, string> = {
              1: `/project/${projectId}/intake/form`,
              2: `/project/${projectId}/intake/story`,
              3: `/project/${projectId}/intake/roles`,
              4: `/project/${projectId}/intake/data`,
            };
            navigate(prevMap[screenNumber]);
          }}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {/* Real auto-save indicator */}
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            {saveStatus === 'saving' ? (
              <><Loader2 size={12} className="animate-spin" /> Auto-saving…</>
            ) : saveStatus === 'saved' ? (
              <><Check size={12} className="text-green-500" /> Saved</>
            ) : (
              'Changes auto-save as you type'
            )}
          </span>

          <button
            onClick={handleNext}
            disabled={!isReadyToNext || isSaving}
            className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D6B63] disabled:bg-slate-300 disabled:cursor-not-allowed
                       text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors min-w-[140px] justify-center"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              screenNumber === 4 ? 'Complete Intake →' : 'Next →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAIInstance: GoogleGenerativeAI | null = null;

// Values that indicate "no real key configured" — avoids firing doomed API calls.
const PLACEHOLDER_KEYS = new Set([
  'YOUR_GEMINI_API_KEY_HERE',
  'placeholder',
  'your-api-key',
  'changeme',
]);

/**
 * Returns a Gemini client only when a plausibly-real API key is configured.
 * A real Google API key is a long token (typically ~39 chars, prefixed "AIza").
 * Anything empty, a known placeholder, or implausibly short is treated as "no key"
 * so callers fall back to deterministic suggestions instead of a failing network call.
 */
export const isGeminiConfigured = (): boolean => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return false;
  if (PLACEHOLDER_KEYS.has(apiKey)) return false;
  if (apiKey.length < 20) return false;
  return true;
};

const getGenAI = () => {
  if (!isGeminiConfigured()) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());
  }
  return genAIInstance;
};

/**
 * Model id, overridable via GEMINI_MODEL. Defaults to a CURRENT model —
 * the old `gemini-1.5-flash` on v1beta now 404s for new keys. `gemini-2.0-flash`
 * is fast, cheap, and supports JSON `responseSchema` structured output.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

/** Shared client accessor for other AI features (e.g. the spec provider). */
export const getGeminiClient = getGenAI;

// ── Deterministic, domain-aware suggestions ───────────────────────────
// Used when Gemini is not configured OR a live call fails, so intake
// suggestions always work (no key required for demos). Superseded/extended
// by the Module 5 deterministic SpecProvider later.
const DETERMINISTIC_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  clinic: {
    story: [
      'Patients arrive at the front desk and provide their ID. The receptionist verifies their details and checks them into the system for their scheduled appointment.',
      'Doctors perform the clinical examination and record the diagnosis in the patient chart, then issue a prescription.',
      'The billing desk reviews the visit and generates an invoice; the patient pays by cash or card and receives a receipt.',
    ],
    roles: [
      'Receptionist: greets patients, schedules appointments, and collects demographic data.',
      'Doctor: diagnoses patients, writes clinical notes, and approves prescriptions.',
      'Manager: oversees payments, staff, and clinic operations.',
    ],
    data: [
      'Patient Records: full name, date of birth, contact number, and blood group.',
      'Visit/Consultation: symptoms, diagnosis, and prescribed medication.',
      'Payments: fee amount, method, status (Pending/Paid), and receipt number.',
    ],
    rules: [
      'Appointments must be cancelled at least 24 hours in advance to avoid a no-show fee.',
      'Only users with the Doctor role can view or edit clinical diagnoses.',
      'A follow-up visit should be flagged if not completed within the recommended window.',
    ],
  },
  school: {
    story: [
      'A prospective student submits an admission application form with their details and previous academic records.',
      'The admission officer schedules an entry test/interview and records the results and decision.',
      'On acceptance, the student is enrolled, assigned a fee plan, and fees are collected and receipted.',
    ],
    roles: [
      'Admission Officer: processes applications, schedules tests, and records decisions.',
      'Teacher: conducts assessments and manages enrolled students.',
      'Accounts Staff: manages fee plans, collects payments, and issues receipts.',
    ],
    data: [
      'Student Records: full name, date of birth, guardian contact, and prior school.',
      'Application: test score, interview notes, and admission decision.',
      'Fee Plan & Payments: amount, due date, status (Pending/Partial/Paid/Overdue).',
    ],
    rules: [
      'Admission requires an entry-test score above the configured threshold (e.g. 60%).',
      'Enrollment is blocked until the first fee installment is paid.',
      'An overdue fee should trigger a reminder to the guardian.',
    ],
  },
};

export const getDeterministicSuggestions = (
  screenSlug: string,
  domain: string
): string[] => {
  const byDomain = DETERMINISTIC_SUGGESTIONS[domain] ?? DETERMINISTIC_SUGGESTIONS.clinic;
  return (
    byDomain[screenSlug] ?? [
      'Describe the start of your process.',
      'Identify the key roles involved.',
      'List the data you need to capture.',
    ]
  );
};

// What each guided screen is meant to capture — used to build guidance prompts.
const SCREEN_INTENT: Record<string, string> = {
  story: 'the end-to-end workflow from first contact to completion — each stage/step in order',
  roles: 'every person, department, and approval authority involved, and what each one is allowed to do',
  data: 'the specific information recorded before, during, and after each stage (the fields per record)',
  rules: 'business rules, thresholds, approvals, exceptions, and operational pain points',
};

export const getSuggestionsService = async (
  content: string,
  screenSlug: string,
  domain: string
) => {
  const genAI = getGenAI();
  const hasContent = !!content && content.trim().length > 0;

  // No key configured → deterministic domain-aware suggestions.
  if (!genAI) {
    return getDeterministicSuggestions(screenSlug, domain);
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
  });

  const intent = SCREEN_INTENT[screenSlug] || 'the important details for this part of the workflow';

  // Two modes per the product spec:
  //  - EMPTY  → tell the user WHAT KIND of requirement to write on this screen.
  //  - WRITTEN → refine/extend what they actually wrote (gaps, missed items).
  const prompt = hasContent
    ? `You are helping a non-technical owner of a ${domain} business describe their workflow.
This is the "${screenSlug}" screen, which should capture ${intent}.
The user has written so far:
"""${content.trim().slice(0, 1500)}"""
Based specifically on what they wrote, suggest 4-5 concise, concrete additions or refinements they likely missed (more detail, related items, edge cases) — tailored to their text, NOT generic boilerplate.
Respond as JSON only: {"suggestions": ["...", "...", "...", "..."]}. Each suggestion is ONE short sentence (max ~18 words), no numbering, no markdown.`
    : `You are helping a non-technical owner of a ${domain} business fill in the "${screenSlug}" screen of a workflow intake form.
This screen should capture ${intent}.
The user hasn't written anything yet. Give 4-5 short bullet-point prompts telling them WHAT KIND of information to write here, tailored to a ${domain} — concrete examples they can expand on (e.g., for roles: "List each staff role and exactly what they are allowed to do").
Respond as JSON only: {"suggestions": ["...", "...", "...", "..."]}. Each suggestion is ONE short sentence (max ~18 words), no numbering, no markdown.`;

  try {
    console.log(`[AI] Suggestions for ${screenSlug}/${domain} (${hasContent ? 'refine' : 'guidance'})`);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    let list: string[] = [];
    try {
      const parsed = JSON.parse(text);
      list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
    } catch {
      // Defensive: model ignored JSON mode — split lines and strip list markers/preamble.
      list = text.split('\n').map((l) => l.replace(/^[-*•\d.\s]+/, '').trim()).filter((l) => l.length > 0 && l.length < 200);
    }
    const cleaned = list.map((s) => String(s).trim()).filter(Boolean).slice(0, 5);
    return cleaned.length ? cleaned : getDeterministicSuggestions(screenSlug, domain);
  } catch (error: any) {
    console.error('Gemini API Error details:', {
      message: error?.message,
      stack: error?.stack,
      promptSnippet: prompt.substring(0, 50) + '...'
    });
    console.error('Gemini API Key present:', !!process.env.GEMINI_API_KEY);

    // Live call failed → fall back to deterministic domain-aware suggestions.
    return getDeterministicSuggestions(screenSlug, domain);
  }
};

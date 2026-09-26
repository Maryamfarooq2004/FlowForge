import type { SpecProvider } from './specProvider';
import {
  AssembledBundleInput,
  WorkflowSpecData,
  FieldType,
  SpecEntity,
  SpecField,
  SpecRole,
  SpecState,
  SpecTransition,
  SpecRule,
  SpecNotificationTrigger,
  SpecSuggestion,
  SpecExplanation,
} from '../../types/spec.types';
import { getGeminiClient, GEMINI_MODEL } from '../ai.service';
import { validateSpec } from './specValidator';

const FIELD_TYPES: FieldType[] = [
  'text', 'richtext', 'number', 'currency', 'date', 'time',
  'boolean', 'enum', 'phone', 'email', 'reference',
];
const CHANNELS = ['email', 'in-app', 'both'] as const;

const slug = (s: string) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'item';

const uniqueKey = (base: string, taken: Set<string>): string => {
  let k = base || 'item';
  let i = 2;
  while (taken.has(k)) k = `${base}_${i++}`;
  taken.add(k);
  return k;
};

const defaultPerms = () => [
  { action: 'View Records', allowed: true },
  { action: 'Create Records', allowed: true },
  { action: 'Edit Records', allowed: false },
  { action: 'Delete Records', allowed: false },
];

/**
 * Validate every suggestion effect against the spec the model actually produced.
 * Anything that references a missing entity/field, uses an unknown kind, or carries
 * a bad field type has its `effect` stripped — the suggestion then renders as
 * advice-only with no Apply button, so the UI never claims a change it cannot make.
 */
export const sanitizeSuggestionEffects = (spec: WorkflowSpecData): WorkflowSpecData => {
  const isValid = (effect: any): boolean => {
    if (!effect || typeof effect !== 'object') return false;
    const entity = (key: string) => spec.entities.find((e) => e.key === key);
    switch (effect.kind) {
      case 'addField':
        return (
          !!entity(effect.entityKey) &&
          !!effect.field?.name &&
          FIELD_TYPES.includes(effect.field?.type)
        );
      case 'addEnumOption':
        return (
          !!effect.option &&
          !!entity(effect.entityKey)?.fields.some(
            (f) => f.name.toLowerCase() === String(effect.fieldName || '').toLowerCase()
          )
        );
      case 'addRule':
        return !!String(effect.rule?.text || '').trim();
      case 'addNotification':
        return (
          !!String(effect.trigger?.event || '').trim() &&
          (CHANNELS as readonly string[]).includes(effect.trigger?.channel)
        );
      default:
        return false;
    }
  };

  spec.suggestions = spec.suggestions.map((s) =>
    isValid((s as any).effect) ? s : { ...s, effect: undefined }
  );
  return spec;
};

/** Build the extraction prompt from the assembled intake. */
const buildPrompt = (bundle: AssembledBundleInput): string => {
  const screens = bundle.guidedScreens
    .sort((a, b) => a.step - b.step)
    .map(
      (s) =>
        `## ${s.title} (step ${s.step})\n${(s.content || '(nothing written)').trim()}\n` +
        `Detected items: ${(s.items || []).join(', ') || '(none)'}`
    )
    .join('\n\n');
  const form = JSON.stringify(bundle.structuredForm || {});

  return `You are a senior software analyst. Convert the following ${bundle.domain} business workflow, described by a non-technical owner, into a normalized application blueprint ("WorkflowSpec") as STRICT JSON.

BUSINESS DOMAIN: ${bundle.domain}
STRUCTURED FORM ANSWERS: ${form}

GUIDED DESCRIPTION:
${screens}

Derive the data model, roles, workflow stages, transitions, rules and alerts FROM THE DESCRIPTION ABOVE. Reflect what THIS business actually described — do not emit a generic template. Prefer 3-6 entities and 3-6 stages.

Return ONLY a JSON object (no markdown, no prose) with exactly this shape:
{
  "entities": [
    {
      "key": "snake_case_singular",
      "name": "Singular Name",
      "label": "Collection Label (plural)",
      "description": "one short sentence",
      "isWorkflowEntity": false,
      "fields": [
        { "name": "Field Name", "type": "<one of ${JSON.stringify(FIELD_TYPES)}>", "required": true, "options": ["only for enum"], "reference": "another entity key (only for reference type)" }
      ]
    }
  ],
  "roles": [ { "key": "snake_case", "name": "Role Name", "description": "", "permissions": [ { "action": "Verb Noun", "allowed": true } ] } ],
  "states": [ { "key": "snake_case", "label": "Human Stage Label", "order": 1, "isInitial": true, "isFinal": false } ],
  "transitions": [ { "from": "state key", "to": "state key", "label": "Action", "role": "role key allowed to do it" } ],
  "businessRules": [ { "text": "plain-language rule", "category": "" } ],
  "notificationTriggers": [ { "event": "short event name", "channel": "email | in-app | both", "description": "" } ],
  "suggestions": [ { "title": "best-practice suggestion", "description": "why", "targetEntity": "entity key", "effect": { } } ],
  "explanations": [ { "subject": "Collection Label", "text": "plain-language explanation, no jargon" } ]
}

HARD REQUIREMENTS:
- EXACTLY ONE entity has "isWorkflowEntity": true — the record that moves through the stages (e.g. the appointment, the application, the order). Give that entity an enum field named "Status" whose options are the stage labels.
- Provide AT LEAST 2 roles, AT LEAST 2 states (one with isInitial true, one with isFinal true), AT LEAST 1 transition, AT LEAST 1 business rule.
- "reference" fields MUST point to another entity's "key" (e.g. an appointment has a reference field to the patient).
- Use ONLY the allowed field types. All keys are lowercase snake_case.
- Output must be valid JSON parseable by JSON.parse.

SUGGESTION EFFECTS:
Each suggestion MAY include an "effect" object describing the concrete change it makes, using EXACTLY one of these shapes:
  {"kind":"addField","entityKey":"<existing entity key>","field":{"name":"...","type":"<one of the field types above>"}}
  {"kind":"addEnumOption","entityKey":"<existing entity key>","fieldName":"<existing field name>","option":"..."}
  {"kind":"addRule","rule":{"text":"..."}}
  {"kind":"addNotification","trigger":{"event":"...","channel":"email|in-app|both","description":"..."}}
Only emit an effect you are certain about; omit it otherwise. "entityKey" and "fieldName" MUST match values you produced above.`;
};

/** Coerce arbitrary model JSON into a strict, self-consistent WorkflowSpecData. */
const normalize = (raw: any, bundle: AssembledBundleInput): WorkflowSpecData => {
  // ── Entities ──
  const entityTaken = new Set<string>();
  const entities: SpecEntity[] = (Array.isArray(raw?.entities) ? raw.entities : []).map(
    (e: any, i: number): SpecEntity => {
      const name = String(e?.name || e?.label || `Record ${i + 1}`).trim();
      const key = uniqueKey(slug(e?.key || name), entityTaken);
      const label = String(e?.label || name).trim();
      const fields: SpecField[] = (Array.isArray(e?.fields) ? e.fields : []).map((f: any): SpecField => {
        const type: FieldType = (FIELD_TYPES as string[]).includes(f?.type) ? f.type : 'text';
        const field: SpecField = { name: String(f?.name || 'Field').trim(), type };
        if (f?.required) field.required = true;
        if (type === 'enum' && Array.isArray(f?.options)) field.options = f.options.map(String);
        if (type === 'reference' && f?.reference) field.reference = slug(f.reference);
        return field;
      });
      const ent: SpecEntity = { key, name, label, fields };
      if (e?.description) ent.description = String(e.description);
      if (e?.isWorkflowEntity) ent.isWorkflowEntity = true;
      return ent;
    }
  );

  // Resolve/prune references that point to unknown entities.
  const entityKeys = new Set(entities.map((e) => e.key));
  for (const e of entities) {
    for (const f of e.fields) {
      if (f.type === 'reference' && (!f.reference || !entityKeys.has(f.reference))) {
        f.type = 'text';
        delete f.reference;
      }
    }
  }

  // Ensure exactly one workflow entity.
  let wf = entities.filter((e) => e.isWorkflowEntity);
  if (wf.length === 0 && entities.length) {
    // Prefer an entity that others reference; else the first.
    const referenced = new Set(
      entities.flatMap((e) => e.fields.filter((f) => f.reference).map((f) => f.reference as string))
    );
    const target = entities.find((e) => !referenced.has(e.key)) || entities[0];
    target.isWorkflowEntity = true;
    wf = [target];
  } else if (wf.length > 1) {
    wf.slice(1).forEach((e) => { delete e.isWorkflowEntity; });
  }

  // ── Roles ──
  const roleTaken = new Set<string>();
  const roles: SpecRole[] = (Array.isArray(raw?.roles) ? raw.roles : []).map((r: any): SpecRole => {
    const name = String(r?.name || r?.key || 'Role').trim();
    const permissions = Array.isArray(r?.permissions) && r.permissions.length
      ? r.permissions.map((p: any) => ({ action: String(p?.action || 'Access').trim(), allowed: p?.allowed !== false }))
      : defaultPerms();
    const role: SpecRole = { key: uniqueKey(slug(r?.key || name), roleTaken), name, permissions };
    if (r?.description) role.description = String(r.description);
    return role;
  });
  const roleKeys = new Set(roles.map((r) => r.key));

  // ── States ──
  const stateTaken = new Set<string>();
  const states: SpecState[] = (Array.isArray(raw?.states) ? raw.states : []).map((s: any, i: number): SpecState => {
    const label = String(s?.label || s?.key || `Stage ${i + 1}`).trim();
    const st: SpecState = {
      key: uniqueKey(slug(s?.key || label), stateTaken),
      label,
      order: Number.isFinite(s?.order) ? Number(s.order) : i + 1,
    };
    if (s?.isInitial) st.isInitial = true;
    if (s?.isFinal) st.isFinal = true;
    return st;
  });
  states.sort((a, b) => a.order - b.order);
  if (states.length && !states.some((s) => s.isInitial)) states[0].isInitial = true;
  if (states.length && !states.some((s) => s.isFinal)) states[states.length - 1].isFinal = true;
  const stateKeys = new Set(states.map((s) => s.key));

  // ── Transitions (drop any referencing unknown states; clear unknown roles) ──
  const transitions: SpecTransition[] = (Array.isArray(raw?.transitions) ? raw.transitions : [])
    .map((t: any): SpecTransition => ({
      from: slug(t?.from),
      to: slug(t?.to),
      label: String(t?.label || 'Advance').trim(),
      role: t?.role ? slug(t.role) : undefined,
    }))
    .filter((t: SpecTransition) => stateKeys.has(t.from) && stateKeys.has(t.to) && t.from !== t.to)
    .map((t: SpecTransition) => (t.role && !roleKeys.has(t.role) ? { ...t, role: undefined } : t));

  // ── Rules ──
  const businessRules: SpecRule[] = (Array.isArray(raw?.businessRules) ? raw.businessRules : [])
    .map((r: any): SpecRule => ({ text: String(r?.text ?? r ?? '').trim(), category: r?.category ? String(r.category) : 'custom' }))
    .filter((r: SpecRule) => r.text.length > 0);

  // ── Notification triggers ──
  const notificationTriggers: SpecNotificationTrigger[] = (Array.isArray(raw?.notificationTriggers) ? raw.notificationTriggers : [])
    .map((n: any): SpecNotificationTrigger => ({
      event: String(n?.event || 'Event').trim(),
      channel: (CHANNELS as readonly string[]).includes(n?.channel) ? n.channel : 'both',
      description: String(n?.description || ''),
    }))
    .filter((n: SpecNotificationTrigger) => n.event.length > 0);

  // ── Suggestions ──
  const suggestions: SpecSuggestion[] = (Array.isArray(raw?.suggestions) ? raw.suggestions : [])
    .map((s: any, i: number): SpecSuggestion => ({
      id: `ai-sugg-${i + 1}`,
      title: String(s?.title || 'Suggestion').trim(),
      description: String(s?.description || ''),
      targetEntity: s?.targetEntity ? slug(s.targetEntity) : undefined,
      applied: false,
      // Carried through as-is; sanitizeSuggestionEffects vets it against the real spec.
      effect: s?.effect,
    }))
    .filter((s: SpecSuggestion) => s.title.length > 0);

  // ── Explanations (fall back to generated if the model omitted them) ──
  const explanations: SpecExplanation[] = (Array.isArray(raw?.explanations) && raw.explanations.length
    ? raw.explanations.map((e: any) => ({ subject: String(e?.subject || '').trim(), text: String(e?.text || '').trim() }))
    : entities.map((e) => ({ subject: e.label, text: `${e.label}: this is where you keep your ${e.name.toLowerCase()} information.` }))
  ).filter((e: SpecExplanation) => e.subject && e.text);

  return {
    domain: bundle.domain,
    entities,
    roles,
    states,
    transitions,
    businessRules,
    notificationTriggers,
    suggestions,
    risks: [],          // filled by validateSpec downstream
    explanations,
    checklist: [],      // filled by validateSpec downstream
    completionScore: 0, // filled by validateSpec downstream
  };
};

/** Strip accidental ```json fences some models still emit under JSON mode. */
const stripFences = (t: string): string =>
  t.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** True for transient errors worth one retry (per REL-3): 503 overload / 429 rate-limit. */
const isTransient = (err: any): boolean => {
  const m = String(err?.message || err);
  return /\b(503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overload|high demand|try again)\b/i.test(m);
};

/**
 * AI-backed SpecProvider. Sends the assembled IntakeBundle to Gemini and asks
 * for a WorkflowSpec derived from the user's own description. Any failure
 * (no client, network error, unparseable/invalid output) transparently falls
 * back to the injected deterministic provider, so the pipeline never breaks.
 */
export class GeminiSpecProvider implements SpecProvider {
  constructor(private readonly fallback: SpecProvider) {}

  async generate(bundle: AssembledBundleInput): Promise<WorkflowSpecData> {
    const client = getGeminiClient();
    if (!client) return this.fallback.generate(bundle);

    try {
      const model = client.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
      });
      const prompt = buildPrompt(bundle);

      // One retry after a short backoff on transient overload/rate-limit (REL-3).
      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (err) {
        if (!isTransient(err)) throw err;
        console.warn('[GeminiSpecProvider] transient error, retrying once in 3s...');
        await sleep(3000);
        result = await model.generateContent(prompt);
      }
      const text = stripFences(result.response.text());
      const parsed = JSON.parse(text);

      const spec = sanitizeSuggestionEffects(normalize(parsed, bundle));
      spec.provider = 'gemini';

      // Guard: the spec must be structurally sound, else fall back.
      const { validationErrors } = validateSpec(spec);
      if (validationErrors.length > 0) {
        throw new Error(`AI spec failed validation: ${validationErrors.join('; ')}`);
      }
      if (!spec.entities.some((e) => e.isWorkflowEntity)) throw new Error('AI spec has no workflow entity');
      if (spec.transitions.length < 1) throw new Error('AI spec has no valid transitions');

      console.log(
        `[GeminiSpecProvider] AI spec ok — ${spec.entities.length} entities, ` +
        `${spec.roles.length} roles, ${spec.states.length} states, ${spec.transitions.length} transitions.`
      );
      return spec;
    } catch (err: any) {
      console.error('[GeminiSpecProvider] falling back to deterministic spec:', err?.message || err);
      return this.fallback.generate(bundle);
    }
  }
}

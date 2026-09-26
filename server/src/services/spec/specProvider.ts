import {
  AssembledBundleInput,
  WorkflowSpecData,
  SpecRole,
  SpecRule,
  SpecSuggestion,
  SpecExplanation,
  SpecField,
} from '../../types/spec.types';
import { getDomainTemplate } from '../../config/domainTemplates';
import { isGeminiConfigured } from '../ai.service';
import { GeminiSpecProvider } from './geminiSpecProvider';

/**
 * A SpecProvider turns an assembled IntakeBundle into a structural WorkflowSpec.
 * The deterministic provider ships now (no AI key required); a GeminiSpecProvider
 * can implement the same interface later and be selected by getSpecProvider().
 */
export interface SpecProvider {
  generate(bundle: AssembledBundleInput): Promise<WorkflowSpecData>;
}

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const screenItems = (bundle: AssembledBundleInput, step: number): string[] => {
  const screen = bundle.guidedScreens.find((s) => s.step === step);
  return (screen?.items || []).map((i) => i.trim()).filter(Boolean);
};

const defaultCustomRolePermissions = () => [
  { action: 'View Records', allowed: true },
  { action: 'Create Records', allowed: true },
  { action: 'Edit Records', allowed: false },
  { action: 'Delete Records', allowed: false },
];

export class DeterministicSpecProvider implements SpecProvider {
  async generate(bundle: AssembledBundleInput): Promise<WorkflowSpecData> {
    const template = getDomainTemplate(bundle.domain);

    const roles = [...template.roles];
    const businessRules = [...template.businessRules];
    const entities = [...template.entities];

    // ── Enrich roles from the "People & Roles" screen (step 2) ──
    const existingRoleNames = new Set(roles.map((r) => r.name.toLowerCase()));
    for (const item of screenItems(bundle, 2)) {
      const label = item.split(/[:\-–]/)[0].trim();
      if (!label || label.length > 40) continue;
      const lower = label.toLowerCase();
      const alreadyKnown = [...existingRoleNames].some(
        (known) => known.includes(lower) || lower.includes(known)
      );
      if (alreadyKnown) continue;
      existingRoleNames.add(lower);
      const role: SpecRole = {
        key: slug(label),
        name: label,
        description: 'Added from your workflow description.',
        permissions: defaultCustomRolePermissions(),
        manuallyAdded: true,
      };
      roles.push(role);
    }

    // ── Enrich fields from the "Data & Tracking" screen (step 3) ──
    // Attach unmatched data points to the primary (non-workflow) entity.
    const primaryEntity = entities.find((e) => !e.isWorkflowEntity) || entities[0];
    if (primaryEntity) {
      const existingFieldNames = new Set(
        primaryEntity.fields.map((f) => f.name.toLowerCase())
      );
      for (const item of screenItems(bundle, 3)) {
        const label = item.split(/[:\-–]/)[0].trim();
        if (!label || label.length > 40) continue;
        if (existingFieldNames.has(label.toLowerCase())) continue;
        existingFieldNames.add(label.toLowerCase());
        const field: SpecField = { name: label, type: 'text' };
        primaryEntity.fields.push(field);
      }
    }

    // ── Enrich business rules from the "Rules & Exceptions" screen (step 4) ──
    const existingRuleTexts = new Set(businessRules.map((r) => r.text.toLowerCase()));
    for (const item of screenItems(bundle, 4)) {
      const text = item.trim();
      if (!text || existingRuleTexts.has(text.toLowerCase())) continue;
      existingRuleTexts.add(text.toLowerCase());
      const rule: SpecRule = { text, category: 'custom' };
      businessRules.push(rule);
    }

    // ── Suggestions (from template candidates) ──
    const suggestions: SpecSuggestion[] = template.candidateSuggestions.map((c) => ({
      ...c,
      applied: false,
    }));

    // ── Plain-language explanations ──
    const explanations: SpecExplanation[] = [
      ...entities.map((e) => ({
        subject: e.label,
        text: `${e.label}: this is where you keep your ${e.name.toLowerCase()} information.`,
      })),
      {
        subject: 'Roles',
        text: `Each person who uses the app signs in with a role. Roles decide what they can see and do.`,
      },
      {
        subject: 'Workflow',
        text: `Work moves through clear stages from start to finish, and only the right people can move it forward.`,
      },
    ];

    return {
      domain: bundle.domain,
      entities,
      roles,
      states: template.states,
      transitions: template.transitions,
      businessRules,
      notificationTriggers: template.notificationTriggers,
      suggestions,
      risks: [], // filled by the validator
      explanations,
      checklist: [], // filled by the validator
      completionScore: 0, // filled by the validator
      provider: 'deterministic',
    };
  }
}

/**
 * Provider factory. When a real Gemini key is configured, the AI-backed
 * provider derives the spec from the user's own description (with the
 * deterministic provider injected as a guaranteed fallback). With no key,
 * the deterministic template provider is used directly.
 */
export const getSpecProvider = (): SpecProvider => {
  const deterministic = new DeterministicSpecProvider();
  if (isGeminiConfigured()) {
    // Lazy require avoids any load-order coupling between the two modules.
    const { GeminiSpecProvider } = require('./geminiSpecProvider') as typeof import('./geminiSpecProvider');
    return new GeminiSpecProvider(deterministic);
  }
  return deterministic;
};

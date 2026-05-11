import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project.model';
import { IntakeBundle } from '../models/IntakeBundle.model';
import { IntakeQuestion } from '../models/IntakeQuestion.model';
import { sendSuccess, sendError } from '../utils/response.utils';
import {
  sanitizeText,
  sanitizeIntakeText,
  sanitizeStringArray,
} from '../utils/sanitize.utils';

// ── Helper: word count ────────────────────────────────────────────────────────

const calculateWordCount = (...texts: string[]): number =>
  texts
    .join(' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

// ── Helper: get or create IntakeBundle for a project ─────────────────────────

const getOrCreateBundle = async (
  projectId: string,
  userId: string
): Promise<InstanceType<typeof IntakeBundle>> => {
  let bundle = await IntakeBundle.findOne({ projectId });
  if (!bundle) {
    bundle = await IntakeBundle.create({
      projectId: new mongoose.Types.ObjectId(projectId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }
  return bundle;
};

// ── 1. GET QUESTIONS ─────────────────────────────────────────────────────────

export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.query;
    if (!category) {
      sendError(res, 'Category is required', 400);
      return;
    }

    const questions = await IntakeQuestion.find({ category }).sort({ order: 1 });
    sendSuccess(res, questions, 'Questions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ── 2. POST /api/intake/:projectId/form ──────────────────────────────────────
// Accepts the CloseEndedForm payload (dynamic question IDs keyed by question.id)
// Maps them to the correct structuredForm fields based on project category.

export const submitIntakeForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId as string;

    // 1. Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      sendError(res, 'Project not found or access denied', 404);
      return;
    }

    const category = project.domain; // 'clinic' | 'school'
    const body = req.body as Record<string, unknown>;

    // 2. Build sanitized structuredForm
    //    The CloseEndedForm submits keys = question.id values from the seed data.
    //    We pick only the fields relevant to the project's category.
    const structuredForm: Record<string, unknown> = {
      submittedAt: new Date(),
    };

    if (category === 'clinic') {
      // Clinic-specific fields (question IDs from seed)
      if (body.clinic_name !== undefined)
        structuredForm.clinicName = sanitizeText(body.clinic_name);
      if (body.doctor_count !== undefined)
        structuredForm.doctorCount = sanitizeText(body.doctor_count);
      if (body.daily_patient_volume !== undefined)
        structuredForm.dailyPatientVolume = sanitizeText(body.daily_patient_volume);
      if (body.appointment_types !== undefined)
        structuredForm.appointmentTypes = sanitizeStringArray(body.appointment_types);
      if (body.payment_methods !== undefined)
        structuredForm.paymentMethods = sanitizeStringArray(body.payment_methods);
      if (body.notification_channels !== undefined)
        structuredForm.notificationChannels = sanitizeStringArray(body.notification_channels);
      if (body.follow_up_frequency !== undefined)
        structuredForm.followUpFrequency = sanitizeText(body.follow_up_frequency);
    } else if (category === 'school') {
      // School-specific fields
      if (body.school_name !== undefined)
        structuredForm.schoolName = sanitizeText(body.school_name);
      if (body.student_capacity !== undefined)
        structuredForm.studentCapacity = sanitizeText(body.student_capacity);
      if (body.grade_levels !== undefined)
        structuredForm.gradeLevels = sanitizeStringArray(body.grade_levels);
      if (body.admission_types !== undefined)
        structuredForm.admissionTypes = sanitizeStringArray(body.admission_types);
      if (body.fee_schedule !== undefined)
        structuredForm.feeSchedule = sanitizeText(body.fee_schedule);
    }

    // Shared fields — present for both categories
    if (body.required_integrations !== undefined)
      structuredForm.requiredIntegrations = sanitizeStringArray(body.required_integrations);
    if (body.approval_levels !== undefined)
      structuredForm.approvalLevels = sanitizeText(body.approval_levels);
    if (body.process_volume !== undefined)
      structuredForm.processVolume = sanitizeText(body.process_volume);

    // 3. Upsert IntakeBundle
    const bundle = await IntakeBundle.findOneAndUpdate(
      { projectId },
      {
        $set: {
          projectId: new mongoose.Types.ObjectId(projectId),
          userId: new mongoose.Types.ObjectId(userId),
          structuredForm,
          status: 'form_complete',
        },
      },
      { upsert: true, new: true }
    );

    // 4. Update project status to 'INTAKE' if not already progressed
    if (project.status === 'INTAKE') {
      await Project.findByIdAndUpdate(projectId, { status: 'INTAKE' });
    }

    sendSuccess(
      res,
      {
        saved: true,
        savedAt: new Date(),
        category,
        structuredForm: bundle.structuredForm,
        status: bundle.status,
      },
      'Intake form submitted successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// ── 3. GET /api/intake/:projectId ────────────────────────────────────────────
// Return full intake bundle for resuming sessions.

export const getIntakeBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId as string;

    // Verify ownership via project
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      sendError(res, 'Project not found or access denied', 404);
      return;
    }

    const bundle = await IntakeBundle.findOne({ projectId });
    if (!bundle) {
      // Return empty bundle shape so front-end can start fresh
      sendSuccess(res, { exists: false, projectId }, 'No intake bundle found yet');
      return;
    }

    sendSuccess(res, bundle, 'Intake bundle retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ── 4. PATCH /api/intake/:projectId/screen/:screenNumber ─────────────────────
// Save text for a single guided screen.
// SECURITY: picks ONLY `text` from body — no mass assignment possible.

export const saveScreen = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, screenNumber } = req.params;
    const userId = (req as any).userId as string;

    const screenNum = parseInt(screenNumber, 10);
    if (![1, 2, 3, 4].includes(screenNum)) {
      sendError(res, 'screenNumber must be 1, 2, 3, or 4', 400);
      return;
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      sendError(res, 'Project not found or access denied', 404);
      return;
    }

    // BUG 1 FIX — mass assignment: pick ONLY `text`
    const { text } = req.body as { text: unknown };

    // BUG 2 FIX — server-side validation (frontend is not security)
    // Enforce maxlength server-side; screen1 allows 5000, others 3000
    const maxLength = screenNum === 1 ? 5000 : 3000;
    const sanitized = sanitizeIntakeText(text, maxLength);

    if (sanitized.length < 10) {
      sendError(res, 'Screen text must be at least 10 characters', 400);
      return;
    }

    // Map screenNumber → schema field name
    const fieldMap: Record<number, string> = {
      1: 'screen1WorkflowStory',
      2: 'screen2PeopleRoles',
      3: 'screen3DataTracking',
      4: 'screen4RulesExceptions',
    };
    const fieldName = fieldMap[screenNum];

    // Upsert — create bundle if it doesn't exist yet
    const bundle = await IntakeBundle.findOneAndUpdate(
      { projectId },
      {
        $set: {
          projectId: new mongoose.Types.ObjectId(projectId),
          userId: new mongoose.Types.ObjectId(userId),
          [fieldName]: sanitized,
        },
        // Add screenNumber to completedScreens without duplicates
        $addToSet: { completedScreens: screenNum },
      },
      { upsert: true, new: true }
    );

    // Promote status if all 4 screens have content
    if (bundle.completedScreens.length === 4 && bundle.status === 'form_complete') {
      await IntakeBundle.findByIdAndUpdate(bundle._id, { status: 'screens_complete' });
    }

    sendSuccess(
      res,
      {
        screenNumber: screenNum,
        saved: true,
        characterCount: sanitized.length,
        completedScreens: bundle.completedScreens,
      },
      `Screen ${screenNum} saved successfully`
    );
  } catch (error) {
    next(error);
  }
};

// ── 5. POST /api/intake/:projectId/assemble ──────────────────────────────────
// Validate all screens, assemble the IntakeBundle JSON, run validation checks.

export const assembleBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userId as string;

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      sendError(res, 'Project not found or access denied', 404);
      return;
    }

    const bundle = await IntakeBundle.findOne({ projectId });

    // BUG 2 FIX — server enforces minimums regardless of UI
    if (!bundle) {
      sendError(res, 'No intake bundle found. Please complete the intake form first.', 400);
      return;
    }

    if (!bundle.structuredForm || !bundle.structuredForm.submittedAt) {
      sendError(res, 'Structured intake form must be submitted before assembling.', 400);
      return;
    }

    // BUG 4 FIX — enforce 50-char minimum per screen
    const MIN_CHARS = 50;
    const screenChecks: Array<{ field: string; value: string; label: string }> = [
      { field: 'screen1', value: bundle.screen1WorkflowStory, label: 'Workflow Story (Screen 1)' },
      { field: 'screen2', value: bundle.screen2PeopleRoles,   label: 'People & Roles (Screen 2)' },
      { field: 'screen3', value: bundle.screen3DataTracking,  label: 'Data Tracking (Screen 3)' },
      { field: 'screen4', value: bundle.screen4RulesExceptions, label: 'Rules & Exceptions (Screen 4)' },
    ];

    const missingScreens = screenChecks.filter((s) => (s.value || '').length < MIN_CHARS);
    if (missingScreens.length > 0) {
      const names = missingScreens.map((s) => s.label).join(', ');
      sendError(
        res,
        `The following screens need at least ${MIN_CHARS} characters: ${names}`,
        400
      );
      return;
    }

    // ── Assemble the IntakeBundle JSON ────────────────────────────
    const totalWordCount = calculateWordCount(
      bundle.screen1WorkflowStory,
      bundle.screen2PeopleRoles,
      bundle.screen3DataTracking,
      bundle.screen4RulesExceptions
    );

    const bundleJson = {
      version: '1.0',
      projectId: projectId.toString(),
      userId: userId.toString(),
      category: project.domain,
      assembledAt: new Date().toISOString(),
      structuredForm: { ...bundle.structuredForm },
      conversational: {
        workflowStory:    bundle.screen1WorkflowStory,
        peopleAndRoles:   bundle.screen2PeopleRoles,
        dataTracking:     bundle.screen3DataTracking,
        rulesAndExceptions: bundle.screen4RulesExceptions,
      },
      metadata: {
        totalWordCount,
        completedScreens: bundle.completedScreens,
        hasDocuments: false, // updated in Module 3
      },
    };

    // ── Run validation checks ─────────────────────────────────────
    const validationErrors: string[] = [];

    // Each screen > 50 chars (already enforced above, but also record in doc)
    screenChecks.forEach((s) => {
      if ((s.value || '').length < MIN_CHARS) {
        validationErrors.push(`${s.label} is too short (minimum ${MIN_CHARS} characters).`);
      }
    });

    // At least 2 roles mentioned in screen2 (heuristic: look for capitalised words or role keywords)
    const roleKeywords = /\b(receptionist|doctor|nurse|manager|admin|teacher|principal|staff|cashier|coordinator|head|officer)\b/gi;
    const rolesFound = (bundle.screen2PeopleRoles.match(roleKeywords) || []).length;
    if (rolesFound < 2) {
      validationErrors.push(
        'Screen 2 (People & Roles) should mention at least 2 distinct roles.'
      );
    }

    // At least 1 rule in screen4 (heuristic: if/when/must/cannot/should keywords)
    const ruleKeywords = /\b(if|when|must|cannot|should|always|never|block|require|allow|deny)\b/gi;
    const rulesFound = (bundle.screen4RulesExceptions.match(ruleKeywords) || []).length;
    if (rulesFound < 1) {
      validationErrors.push(
        'Screen 4 (Rules & Exceptions) should describe at least one business rule.'
      );
    }

    const isValidated = validationErrors.length === 0;

    // ── Persist assembled bundle ──────────────────────────────────
    const updatedBundle = await IntakeBundle.findByIdAndUpdate(
      bundle._id,
      {
        $set: {
          bundleJson,
          validationErrors,
          isValidated,
          status: 'assembled',
        },
        $inc: { bundleVersion: 1 },
      },
      { new: true }
    );

    sendSuccess(
      res,
      {
        bundle: bundleJson,
        bundleVersion: updatedBundle?.bundleVersion,
        validationErrors,
        isValidated,
      },
      isValidated
        ? 'IntakeBundle assembled and validated successfully'
        : 'IntakeBundle assembled with validation warnings'
    );
  } catch (error) {
    next(error);
  }
};

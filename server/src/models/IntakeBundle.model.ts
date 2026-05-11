import mongoose, { Document, Schema } from 'mongoose';

export interface IIntakeBundle extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  // Close-ended structured form
  structuredForm: {
    // Clinic-specific
    clinicName?: string;
    doctorCount?: string;
    dailyPatientVolume?: string;
    appointmentTypes?: string[];
    paymentMethods?: string[];
    notificationChannels?: string[];
    followUpFrequency?: string;
    // School-specific
    schoolName?: string;
    studentCapacity?: string;
    gradeLevels?: string[];
    admissionTypes?: string[];
    feeSchedule?: string;
    // Shared
    requiredIntegrations?: string[];
    approvalLevels?: string;
    processVolume?: string;
    submittedAt?: Date;
  };

  // 4 guided screens — plain text from user
  screen1WorkflowStory: string;
  screen2PeopleRoles: string;
  screen3DataTracking: string;
  screen4RulesExceptions: string;

  // Screen completion tracking
  completedScreens: number[];

  // Assembled bundle (set when user hits "Send to AI")
  bundleJson: Record<string, unknown> | null;
  bundleVersion: number;

  // Validation
  validationErrors: string[];
  isValidated: boolean;

  // Status
  status: 'draft' | 'form_complete' | 'screens_complete' | 'assembled' | 'sent_to_ai';

  createdAt: Date;
  updatedAt: Date;
}

const intakeBundleSchema = new Schema<IIntakeBundle>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Close-ended structured form ──────────────────────────────
    structuredForm: {
      // Clinic-specific
      clinicName:           { type: String, default: '' },
      doctorCount:          { type: String, default: '' },
      dailyPatientVolume:   { type: String, default: '' },
      appointmentTypes:     { type: [String], default: [] },
      paymentMethods:       { type: [String], default: [] },
      notificationChannels: { type: [String], default: [] },
      followUpFrequency:    { type: String, default: '' },

      // School-specific
      schoolName:      { type: String, default: '' },
      studentCapacity: { type: String, default: '' },
      gradeLevels:     { type: [String], default: [] },
      admissionTypes:  { type: [String], default: [] },
      feeSchedule:     { type: String, default: '' },

      // Shared
      requiredIntegrations: { type: [String], default: [] },
      approvalLevels:       { type: String, default: '' },
      processVolume:        { type: String, default: '' },
      submittedAt:          { type: Date },
    },

    // ── 4 guided screens ─────────────────────────────────────────
    screen1WorkflowStory:   { type: String, maxlength: 5000, default: '' },
    screen2PeopleRoles:     { type: String, maxlength: 3000, default: '' },
    screen3DataTracking:    { type: String, maxlength: 3000, default: '' },
    screen4RulesExceptions: { type: String, maxlength: 3000, default: '' },

    // ── Screen completion tracking ────────────────────────────────
    completedScreens: { type: [Number], default: [] },

    // ── Assembled bundle ─────────────────────────────────────────
    bundleJson:    { type: Schema.Types.Mixed, default: null },
    bundleVersion: { type: Number, default: 0 },

    // ── Validation ───────────────────────────────────────────────
    validationErrors: { type: [String], default: [] },
    isValidated:      { type: Boolean, default: false },

    // ── Status ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'form_complete', 'screens_complete', 'assembled', 'sent_to_ai'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

intakeBundleSchema.index({ projectId: 1 });
intakeBundleSchema.index({ userId: 1 });

export const IntakeBundle = mongoose.model<IIntakeBundle>('IntakeBundle', intakeBundleSchema);

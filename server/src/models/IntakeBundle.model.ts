import mongoose, { Document, Schema } from 'mongoose';

// Each guided screen's data stored separately
export interface IGuidedScreenData {
  screen: 1 | 2 | 3 | 4;
  content: string;          // raw text the user typed
  detectedItems: string[];  // auto-detected roles / rules / fields
  confirmedItems: string[]; // items user confirmed
  isComplete: boolean;
  savedAt: Date;
}

export interface IStructuredFormData {
  // Clinic-specific
  patientVolume?: string;
  appointmentTypes?: string[];
  consultationFeeStructure?: string;
  followUpFrequency?: string;
  // School-specific
  gradeLevels?: string[];
  enrollmentCapacity?: string;
  admissionTestTypes?: string[];
  feeSchedule?: string;
  // Shared
  roles?: string[];
  approvalLevels?: string[];
  notificationChannels?: string[];
  paymentMethods?: string[];
  [key: string]: any; // allow extra fields
}

export interface IIntakeBundle extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  domain: 'clinic' | 'school';
  // Phase 1: Structured close-ended form
  structuredFormData: IStructuredFormData;
  structuredFormComplete: boolean;
  // Phase 2: Guided screens (4 screens)
  guidedScreens: IGuidedScreenData[];
  // Assembled bundle (built after all 4 screens complete)
  assembledBundle: Record<string, any> | null;
  isAssembled: boolean;
  assembledAt?: Date;
  // Validation result
  validationErrors: string[];
  validationWarnings: string[];
  createdAt: Date;
  updatedAt: Date;
}

const guidedScreenSchema = new Schema<IGuidedScreenData>(
  {
    screen:          { type: Number, enum: [1, 2, 3, 4], required: true },
    content:         { type: String, default: '' },
    detectedItems:   { type: [String], default: [] },
    confirmedItems:  { type: [String], default: [] },
    isComplete:      { type: Boolean, default: false },
    savedAt:         { type: Date, default: Date.now },
  },
  { _id: false }
);

const intakeBundleSchema = new Schema<IIntakeBundle>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,  // One IntakeBundle per project
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domain: { type: String, enum: ['clinic', 'school'], required: true },
    structuredFormData:     { type: Schema.Types.Mixed, default: {} },
    structuredFormComplete: { type: Boolean, default: false },
    guidedScreens:          { type: [guidedScreenSchema], default: [] },
    assembledBundle:        { type: Schema.Types.Mixed, default: null },
    isAssembled:            { type: Boolean, default: false },
    assembledAt:            { type: Date },
    validationErrors:       { type: [String], default: [] },
    validationWarnings:     { type: [String], default: [] },
  },
  { timestamps: true }
);

export const IntakeBundle = mongoose.model<IIntakeBundle>(
  'IntakeBundle',
  intakeBundleSchema
);

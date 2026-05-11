import mongoose, { Document, Schema } from 'mongoose';

export type ProjectStatus = 'INTAKE' | 'SPEC_READY' | 'PREVIEW' | 'LIVE';
export type ProjectDomain = 'clinic' | 'school';

// Tracks exactly which step the user is on
export interface IProjectProgress {
  currentPhase: 'domain' | 'intake_form' | 'guided_story' | 
                'guided_roles' | 'guided_data' | 'guided_rules' | 
                'intake_review' | 'documents' | 'theme' | 
                'blueprint' | 'alerts' | 'generating' | 
                'preview' | 'deployment';
  lastActiveScreen: string;  // the exact route path
  completedSteps: string[];  // array of completed step names
}

export interface IProject extends Document {
  name: string;
  domain: ProjectDomain;
  status: ProjectStatus;
  userId: mongoose.Types.ObjectId;
  businessName?: string;
  description?: string;
  isArchived: boolean;
  progress: IProjectProgress;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProjectProgress>(
  {
    currentPhase: {
      type: String,
      enum: [
        'domain', 'intake_form', 'guided_story', 'guided_roles',
        'guided_data', 'guided_rules', 'intake_review', 'documents',
        'theme', 'blueprint', 'alerts', 'generating', 'preview', 'deployment'
      ],
      default: 'intake_form',
    },
    lastActiveScreen: { type: String, default: '' },
    completedSteps:   { type: [String], default: [] },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters'],
      maxlength: [50, 'Project name cannot exceed 50 characters'],
    },
    domain: {
      type: String,
      enum: ['clinic', 'school'],
      required: [true, 'Domain is required'],
    },
    status: {
      type: String,
      enum: ['INTAKE', 'SPEC_READY', 'PREVIEW', 'LIVE'],
      default: 'INTAKE',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessName: { type: String, trim: true },
    description:  { type: String, trim: true },
    isArchived:   { type: Boolean, default: false, index: true },
    progress: {
      type: progressSchema,
      default: () => ({
        currentPhase: 'intake_form',
        lastActiveScreen: '',
        completedSteps: [],
      }),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// A user cannot have two projects with the same name
projectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', projectSchema);

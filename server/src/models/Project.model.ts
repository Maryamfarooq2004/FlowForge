import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  domain: 'clinic' | 'school';
  status: 'INTAKE' | 'SPEC_READY' | 'PREVIEW' | 'LIVE';
  userId: mongoose.Types.ObjectId;
  businessName?: string;
  description?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    description: { type: String, trim: true },
    isArchived: { type: Boolean, default: false, index: true },
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

// Compound index: user's project names must be unique (not global)
projectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Project = mongoose.model<IProject>('Project', projectSchema);

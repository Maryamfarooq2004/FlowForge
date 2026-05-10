import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: [true, 'Project name is required'], 
    trim: true, 
    maxlength: [100, 'Project name cannot exceed 100 characters'] 
  },
  organizationName: { type: String, trim: true },
  category: { 
    type: String, 
    enum: ['clinic', 'school'], 
    required: [true, 'Category is required'] 
  },
  status: { 
    type: String, 
    enum: ['intake', 'spec_ready', 'preview', 'live', 'archived', 'generating', 'extraction_failed'],
    default: 'intake' 
  },
  stagingUrl: { type: String },
  liveUrl: { type: String },
  customDomain: { type: String },
  isArchived: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

// SECURITY: Every query on projects MUST be scoped to userId
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, isArchived: 1 });

export const Project = mongoose.model('Project', projectSchema);

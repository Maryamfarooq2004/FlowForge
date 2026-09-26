import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

/**
 * An uploaded source document (Excel/CSV/PDF) whose parsed content + heuristic
 * detections can be reviewed and merged into the project's IntakeBundle
 * (Module 3, Node-first). Image/diagram OCR is deferred.
 */
export type DocumentType = 'excel' | 'csv' | 'pdf';
export type DocumentStatus = 'parsed' | 'failed' | 'merged';

export interface IDocumentDetected {
  roles: string[];
  fields: string[];
  rules: string[];
}

export interface IDocument extends MongooseDocument {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  type: DocumentType;
  status: DocumentStatus;
  extraction: Record<string, unknown>;
  detected: IDocumentDetected;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    storageKey: { type: String, required: true },
    type: { type: String, enum: ['excel', 'csv', 'pdf'], required: true },
    status: { type: String, enum: ['parsed', 'failed', 'merged'], default: 'parsed' },
    extraction: { type: Schema.Types.Mixed, default: {} },
    detected: {
      type: new Schema<IDocumentDetected>(
        {
          roles: { type: [String], default: [] },
          fields: { type: [String], default: [] },
          rules: { type: [String], default: [] },
        },
        { _id: false }
      ),
      default: () => ({ roles: [], fields: [], rules: [] }),
    },
    error: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

documentSchema.index({ projectId: 1, createdAt: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

import mongoose, { Document, Schema } from 'mongoose';
import { ThemeColors, ThemeFonts } from '../types/theme.types';

/**
 * Per-project theme (one per project). Stores the brand colors + fonts chosen in
 * the Theme Studio; consumed by the live Preview now and by the Frontend
 * Generator later. Kept in its own collection so `Project` stays lean.
 */
export interface ITheme extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  colors: ThemeColors;
  fonts: ThemeFonts;
  presetKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const colorsSchema = new Schema<ThemeColors>(
  {
    primary: { type: String, required: true },
    secondary: { type: String, required: true },
    accent: { type: String, required: true },
  },
  { _id: false }
);

const fontsSchema = new Schema<ThemeFonts>(
  {
    heading: { type: String, required: true },
    body: { type: String, required: true },
  },
  { _id: false }
);

const themeSchema = new Schema<ITheme>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    colors: { type: colorsSchema, required: true },
    fonts: { type: fontsSchema, required: true },
    presetKey: { type: String },
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

export const Theme = mongoose.model<ITheme>('Theme', themeSchema);

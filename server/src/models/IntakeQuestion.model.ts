import mongoose, { Schema } from 'mongoose';

const questionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, enum: ['clinic', 'school'], required: true },
  section: { type: String, required: true },
  question: { type: String, required: true },
  type: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  yesLabel: { type: String },
  noLabel: { type: String },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

questionSchema.index({ category: 1, order: 1 });

export const IntakeQuestion = mongoose.model('IntakeQuestion', questionSchema);

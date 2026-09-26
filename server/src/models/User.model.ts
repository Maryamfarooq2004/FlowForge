import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  organizationType: 'clinic' | 'school';
  businessName?: string;
  logoUrl?: string;
  isEmailVerified: boolean;
  role: 'user' | 'admin';
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isLocked(): boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    organizationType: {
      type: String,
      enum: {
        values: ['clinic', 'school'],
        message: 'Organization type must be clinic or school',
      },
      required: [true, 'Organization type is required'],
    },
    businessName: { type: String, trim: true, default: '' },
    logoUrl: { type: String, default: null },
    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    refreshTokens: { type: [String], default: [], select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationTokenExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetTokenExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });

// Instance method: check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Instance method: compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);

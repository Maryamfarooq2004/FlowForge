import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'], 
    trim: true, 
    maxlength: [100, 'Name cannot exceed 100 characters'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: [8, 'Password must be at least 8 characters'], 
    select: false 
  },
  organizationType: { 
    type: String, 
    enum: ['clinic', 'school'], 
    required: [true, 'Organization type is required'] 
  },
  businessName: { type: String, trim: true, maxlength: 200 },
  logoUrl: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpiry: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpiry: { type: Date, select: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshTokens: [{ 
    token: String, 
    createdAt: { type: Date, default: Date.now } 
  }],
  lastLoginAt: { type: Date },
}, { 
  timestamps: true 
});

// SECURITY: Never return password or internal auth fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpiry;
  delete user.passwordResetToken;
  delete user.passwordResetExpiry;
  return user;
};

// SECURITY: Hash password ONLY when modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

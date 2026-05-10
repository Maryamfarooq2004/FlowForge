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
  orgType: { 
    type: String, 
    enum: { 
      values: ['clinic', 'school'], 
      message: 'Organization type must be clinic or school' 
    }, 
    required: [true, 'Organization type is required'] 
  },
  businessName: { type: String, trim: true },
  logoUrl: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  passwordResetToken: { type: String, select: false },
  passwordResetTokenExpires: { type: Date, select: false },
  refreshTokens: [{ 
    token: String, 
    createdAt: { type: Date, default: Date.now } 
  }],
  lastLoginAt: { type: Date },
  lastLoginIp: { type: String },
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
  delete user.passwordResetToken;
  delete user.passwordResetTokenExpires;
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

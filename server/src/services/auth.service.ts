import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { AppError } from '../utils/appError';

export const register = async (data: any) => {
  const { fullName, email, orgType, password } = data;
  console.log('[Service] Registering with:', { fullName, email, orgType, password: password ? '***' : 'MISSING' });

  // Step 1: Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    console.log('[Service] Invalid email format:', email);
    throw new AppError('Please provide a valid email address.', 400, 'INVALID_EMAIL_FORMAT');
  }

  // Step 2: Check email uniqueness
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError(
      'An account with this email already exists.', 
      409, 
      'EMAIL_ALREADY_EXISTS'
    );
  }

  // Step 3: Validate password strength
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new AppError(
      'Password must be at least 8 characters with at least one letter and one number.',
      400,
      'WEAK_PASSWORD'
    );
  }

  // Step 4: Create user — active immediately, no verification needed
  // Note: Password hashing is handled by pre-save hook in User.model.ts
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    orgType,
    password, // Pre-save hook hashes this
    lastLoginAt: new Date()
  });

  // Step 5: Generate tokens
  const accessToken = signAccessToken({ 
    userId: user._id.toString(), 
    email: user.email, 
    role: user.role 
  });
  
  const { token: refreshToken } = signRefreshToken(user._id.toString());

  // Step 6: Store hashed refresh token
  const hashedRefresh = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: { token: hashedRefresh } }
  });

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      orgType: user.orgType,
      businessName: user.businessName,
      logoUrl: user.logoUrl,
      createdAt: user.createdAt
    },
    accessToken,
    refreshToken
  };
};

export const loginUser = async (credentials: any) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email }).select('+password +lockUntil +loginAttempts');
  
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError('Account is locked. Try again later.', 423, 'ACCOUNT_LOCKED');
  }

  const isMatch = await (user as any).comparePassword(password);
  
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    }
    await user.save();
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Reset attempts
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  (user as any).lastLoginAt = new Date();

  // Generate tokens
  const accessToken = signAccessToken({ 
    userId: user._id.toString(), 
    email: user.email, 
    role: user.role 
  });
  
  const { token: refreshToken } = signRefreshToken(user._id.toString());

  // Store hashed refresh token
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokens.push({ token: hashedToken });
  
  await user.save();

  return { user, accessToken, refreshToken };
};

export const rotateToken = async (oldRefreshToken: string) => {
  try {
    const decoded = verifyRefreshToken(oldRefreshToken);
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    
    if (!user) throw new Error();

    const hashedOldToken = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === hashedOldToken);

    if (tokenIndex === -1) {
      (user as any).refreshTokens = [];
      await user.save();
      throw new AppError('Security breach detected. Please login again.', 401, 'TOKEN_REUSE');
    }

    user.refreshTokens.splice(tokenIndex, 1);
    
    const accessToken = signAccessToken({ 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });
    
    const { token: newRefreshToken } = signRefreshToken(user._id.toString());
    const hashedNewToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    
    user.refreshTokens.push({ token: hashedNewToken });
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error: any) {
    throw error instanceof AppError ? error : new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
};

export const logoutUser = async (userId: string, refreshToken: string) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    (user as any).refreshTokens = user.refreshTokens.filter(rt => rt.token !== hashedToken);
    await user.save();
  }
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await user.save();
  
  // NOTE: Email sending logic removed as requested. 
  // In a real "forgot password" flow, you would normally send an email here.
  console.log(`[DEBUG] Password reset link: https://flow-forge-k66k.vercel.app/reset-password/${resetToken}`);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: new Date() }
  }).select('+passwordResetToken +passwordResetTokenExpires');

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  (user as any).refreshTokens = [];
  
  await user.save();
};

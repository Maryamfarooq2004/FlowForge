import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

export const registerUser = async (userData: any) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw { statusCode: 400, message: 'Email already registered' };
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    ...userData,
    emailVerificationToken: verificationToken,
    emailVerificationExpiry: verificationExpiry,
  });

  // TODO: Send email via SendGrid here in a real app
  console.log(`Verification Token for ${user.email}: ${verificationToken}`);

  return { message: 'Check your email to verify your account' };
};

export const verifyEmail = async (token: string) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    throw { statusCode: 400, message: 'Invalid or expired verification token' };
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
};

export const loginUser = async (credentials: any) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email }).select('+password +lockUntil +loginAttempts');
  
  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw { statusCode: 403, message: 'Account is locked. Try again later.' };
  }

  const isMatch = await (user as any).comparePassword(password);
  
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    }
    await user.save();
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  if (!user.isEmailVerified) {
    throw { statusCode: 403, message: 'Please verify your email before logging in.' };
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

  // SECURITY: Store HASH of refresh token
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

    // Find if the token exists (using hash)
    const hashedOldToken = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === hashedOldToken);

    if (tokenIndex === -1) {
      // SECURITY: Token reuse detected! Invalidate ALL tokens for this user
      user.refreshTokens = [];
      await user.save();
      throw { statusCode: 401, message: 'Security breach detected. Please login again.' };
    }

    // Rotate: Remove old, add new
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
    throw error.statusCode ? error : { statusCode: 401, message: 'Invalid refresh token' };
  }
};

export const logoutUser = async (userId: string, refreshToken: string) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== hashedToken);
    await user.save();
  }
};

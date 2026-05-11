import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User.model';
import { AppError } from '../utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Helper: sanitize user for response (no sensitive fields)
const sanitizeUser = (user: IUser) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  orgType: user.organizationType,
  businessName: user.businessName,
  logoUrl: user.logoUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  role: user.role,
});

// Helper: hash a refresh token for storage
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// ── REGISTER ───────────────────────────────────────

export const registerService = async (
  fullName: string,
  email: string,
  organizationType: 'clinic' | 'school',
  password: string
) => {
  // 1. Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address.', 400, 'INVALID_EMAIL');
  }

  // 2. Validate password
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400, 'WEAK_PASSWORD');
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError(
      'Password must contain at least one letter and one number.',
      400,
      'WEAK_PASSWORD'
    );
  }

  // 3. Check existing email (explicit check before Mongoose to control error message)
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError(
      'An account with this email already exists.',
      409,
      'EMAIL_EXISTS'
    );
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 5. Create user
  let user: IUser;
  try {
    user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      organizationType,
      password: hashedPassword,
      lastLoginAt: new Date(),
    });
  } catch (err: any) {
    // Catch race condition duplicate key (two simultaneous registrations)
    if (err.code === 11000) {
      throw new AppError(
        'An account with this email already exists.',
        409,
        'EMAIL_EXISTS'
      );
    }
    throw err;
  }

  // 6. Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // 7. Store hashed refresh token
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: hashToken(refreshToken) },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

// ── LOGIN ──────────────────────────────────────────

export const loginService = async (
  email: string,
  password: string,
  ip?: string
) => {
  // 1. Find user (explicitly select password and security fields)
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+password +loginAttempts +lockUntil +refreshTokens');

  if (!user) {
    // Generic message — do not reveal whether email exists
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Check account lock
  if (user.isLocked()) {
    const retryAfter = user.lockUntil
      ? Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000)
      : 900;
    throw new AppError(
      `Account locked. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      423,
      'ACCOUNT_LOCKED',
    );
  }

  // 3. Verify password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment failed attempts
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updateData: Partial<IUser> =
      newAttempts >= MAX_LOGIN_ATTEMPTS
        ? {
          loginAttempts: newAttempts,
          lockUntil: new Date(Date.now() + LOCK_DURATION_MS),
        }
        : { loginAttempts: newAttempts };

    await User.findByIdAndUpdate(user._id, updateData);

    const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
    if (remaining <= 0) {
      throw new AppError(
        'Too many failed attempts. Account locked for 15 minutes.',
        423,
        'ACCOUNT_LOCKED'
      );
    }
    throw new AppError(
      `Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      401,
      'INVALID_CREDENTIALS'
    );
  }

  // 4. Successful login — reset lockout
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Keep max 5 refresh tokens (remove oldest if exceeded)
  const currentTokens = user.refreshTokens || [];
  const updatedTokens =
    currentTokens.length >= 5
      ? [...currentTokens.slice(-4), hashToken(refreshToken)]
      : [...currentTokens, hashToken(refreshToken)];

  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    lockUntil: undefined,
    refreshTokens: updatedTokens,
    lastLoginAt: new Date(),
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

// ── REFRESH TOKEN ──────────────────────────────────

export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError('No refresh token provided.', 401, 'NO_REFRESH_TOKEN');
  }

  // Verify token signature and expiry
  const payload = verifyRefreshToken(refreshToken);

  // Find user and check token exists in DB
  const user = await User.findById(payload.userId)
    .select('+refreshTokens');

  if (!user) {
    throw new AppError('User not found.', 401, 'INVALID_REFRESH_TOKEN');
  }

  const hashedIncoming = hashToken(refreshToken);
  const tokenExists = user.refreshTokens.includes(hashedIncoming);

  if (!tokenExists) {
    // Token reuse detected — clear ALL tokens (security measure)
    await User.findByIdAndUpdate(payload.userId, { refreshTokens: [] });
    throw new AppError(
      'Refresh token reuse detected. Please log in again.',
      401,
      'TOKEN_REUSE_DETECTED'
    );
  }

  // Rotate: remove old token, add new one
  const newAccessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  const updatedTokens = user.refreshTokens
    .filter(t => t !== hashedIncoming)
    .concat(hashToken(newRefreshToken));

  await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// ── LOGOUT ─────────────────────────────────────────

export const logoutService = async (refreshToken: string) => {
  if (!refreshToken) return; // Already logged out

  try {
    const payload = verifyRefreshToken(refreshToken);
    const hashedToken = hashToken(refreshToken);
    await User.findByIdAndUpdate(payload.userId, {
      $pull: { refreshTokens: hashedToken },
    });
  } catch {
    // Token invalid or expired — still clear cookie on controller side
  }
};

// ── GET ME ─────────────────────────────────────────

export const getMeService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  return sanitizeUser(user);
};
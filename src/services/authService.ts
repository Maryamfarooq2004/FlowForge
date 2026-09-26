import axiosInstance from '../lib/axios';
import type { RegisterDto, LoginDto, AuthResponse } from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/auth.types';

const authService = {
  register: (data: RegisterDto) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginDto) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () =>
    axiosInstance.post<ApiResponse<null>>('/auth/logout'),

  refreshToken: () =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/refresh-token'),

  getMe: () =>
    axiosInstance.get<ApiResponse<{ user: User }>>('/auth/me'),

  updateProfile: (data: Partial<Pick<User, 'fullName' | 'businessName' | 'logoUrl'>>) =>
    axiosInstance.patch<ApiResponse<{ user: User }>>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.patch<ApiResponse<null>>('/auth/change-password', data),

  forgotPassword: (email: string) =>
    axiosInstance.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    axiosInstance.post<ApiResponse<null>>('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    axiosInstance.post<ApiResponse<{ user: User }>>('/auth/verify-email', { token }),

  resendVerification: () =>
    axiosInstance.post<ApiResponse<{ alreadyVerified: boolean }>>('/auth/resend-verification'),

  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('logo', file);
    return axiosInstance.post<ApiResponse<{ user: User }>>('/auth/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default authService;

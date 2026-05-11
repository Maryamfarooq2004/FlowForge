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
};

export default authService;

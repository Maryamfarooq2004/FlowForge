import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import { queryClient } from '../lib/queryClient';
import type { RegisterDto, LoginDto } from '../types/auth.types';
import type { ApiError } from '../types/global.types';

export const useRegister = () => {
  const { setUser, setAccessToken, setAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data!;
      setUser(user);
      setAccessToken(accessToken);
      setAuthenticated(true);
      toast.success(`Welcome to FlowForge, ${user.fullName.split(' ')[0]}!`);
      navigate('/hub');
    },
    onError: (error: ApiError) => {
      // Return error for component-level handling (inline field errors)
      return error;
    },
  });
};

export const useLogin = () => {
  const { setUser, setAccessToken, setAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data!;
      setUser(user);
      setAccessToken(accessToken);
      setAuthenticated(true);
      navigate('/hub');
    },
    onError: (error: ApiError) => {
      return error;
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Always clear auth and redirect, even if API call fails
      clearAuth();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};

export const useUpdateProfile = () => {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      const { user } = response.data.data!;
      setUser(user);
      toast.success('Profile updated successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    },
  });
};

export const useUploadLogo = () => {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => authService.uploadLogo(file),
    onSuccess: (response) => {
      const { user } = response.data.data!;
      setUser(user);
      toast.success('Logo updated.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to upload logo.');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onError: (error: ApiError) => {
      // Non-fatal; the page shows a generic "check your inbox" regardless.
      return error;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword(data),
    onError: (error: ApiError) => {
      return error;
    },
  });
};

export const useVerifyEmail = () => {
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: (response) => {
      const verifiedUser = response.data.data?.user;
      // If this browser is the logged-in account, reflect the verified flag so
      // the banner clears immediately without a refresh.
      if (verifiedUser && user && verifiedUser.id === user.id) {
        setUser({ ...user, isEmailVerified: true });
      }
    },
    onError: (error: ApiError) => {
      return error;
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: () => authService.resendVerification(),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Verification email sent.');
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Could not send verification email.');
    },
  });
};

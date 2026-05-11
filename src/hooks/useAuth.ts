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

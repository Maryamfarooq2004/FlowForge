import axiosInstance from '../lib/axios';

export interface RegisterDto {
  fullName: string;
  email: string;
  organizationType: 'clinic' | 'school';
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

const authService = {
  register: (data: RegisterDto) =>
    axiosInstance.post('/auth/register', data),

  login: (data: LoginDto) =>
    axiosInstance.post('/auth/login', data),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  refreshToken: () =>
    axiosInstance.post('/auth/refresh-token'),

  getMe: () =>
    axiosInstance.get('/auth/me'),
};

export default authService;

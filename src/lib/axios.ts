import axios from 'axios';
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { useAuthStore } from '../store/authStore';
import { queryClient } from './queryClient';

// Hardcoded Railway URL — never use env variable for this
// to avoid Vercel build-time substitution issues
const BASE_URL = 'https://flowforge-production-0fc1.up.railway.app';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,   // CRITICAL: sends httpOnly refresh cookie cross-domain
  timeout: 30000,          // Railway cold start can take up to 15s
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── REQUEST INTERCEPTOR ────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// ── RESPONSE INTERCEPTOR — TOKEN REFRESH QUEUE ────────────────

let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedRequestsQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Network error — no response from Railway
    if (!error.response) {
      console.error('[API] Network error — Railway unreachable:', error.message);
      return Promise.reject({
        response: {
          data: {
            success: false,
            code: 'NETWORK_ERROR',
            message: 'Cannot connect to server. Please check your connection.',
          },
        },
      });
    }

    const status = error.response.status;

    // Handle 401 — attempt silent token refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post('/auth/refresh-token');
        const newToken: string = data.data.accessToken;

        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear everything
        useAuthStore.getState().clearAuth();
        queryClient.clear();
        // Redirect to login only if not already there
        if (!window.location.pathname.startsWith('/login')) {
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log all other errors
    if (import.meta.env.DEV) {
      console.error(
        `[API] Error ${status}:`,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

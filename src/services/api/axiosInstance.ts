import axios from 'axios';

// Fallback to hardcoded URL if env variable is missing
const baseURL = import.meta.env.DEV 
  ? 'http://127.0.0.1:5000' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://flowforge-production-0fc1.up.railway.app');

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401s
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          refreshQueue.push(() => {
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt to refresh token via backend httpOnly cookie
        await axios.post(`${baseURL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        
        // Retry all queued requests
        refreshQueue.forEach(cb => cb());
        refreshQueue = [];
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear queue
        refreshQueue = [];
        
        // BUG FIX: Prevent infinite refresh loop
        // 1. Don't redirect if the failed request was the initial /me check
        const isMeRequest = originalRequest.url?.includes('/auth/me');
        
        // 2. Don't redirect if we are already on a public page
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/'];
        const isPublicPath = publicPaths.some(path => 
          path === '/' ? window.location.pathname === '/' : window.location.pathname.includes(path)
        );
        
        if (!isMeRequest && !isPublicPath) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

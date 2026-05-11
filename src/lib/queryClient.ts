import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes after component unmounts
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Never retry auth errors
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        if (error?.response?.status === 404) return false;
        // Retry network errors and 5xx up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Refetch when user comes back to tab
      refetchOnWindowFocus: true,
      // Do not refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 0,
    },
  },
});

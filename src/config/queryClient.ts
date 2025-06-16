
import { QueryClient } from '@tanstack/react-query';

// Create a client outside the component to prevent recreation
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

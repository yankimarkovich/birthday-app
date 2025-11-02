import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import App from './App.tsx';
import { Toaster } from 'sonner';
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

//Order Matters:
//Strict mode ( mount on dev env only) Wraps everything + Adds development checks
//QueryClientProvider Provides React Query to all components + Must be outside AuthProvider because AuthProvider might use queries
//AuthProvider - Provides auth state to all components + Can use React Query inside here
//App - Actual App Can use both React Query AND Auth

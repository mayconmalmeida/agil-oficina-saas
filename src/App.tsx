
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import AppRoutes from '@/components/app/AppRoutes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AdminProvider>
            <AppRoutes />
            <Toaster />
          </AdminProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

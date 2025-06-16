
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from '@/config/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import RouteManager from '@/components/layout/RouteManager';
import AppRoutes from '@/components/app/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <RouteManager>
            <AppRoutes />
            <Toaster />
          </RouteManager>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;


import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { AdminProvider } from '@/contexts/AdminContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRoutes from '@/components/app/AppRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AdminProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AdminProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

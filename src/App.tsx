
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { Toaster } from '@/components/ui/sonner';
import AppRoutes from '@/components/app/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <AppRoutes />
          <Toaster />
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

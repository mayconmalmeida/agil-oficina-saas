
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from '@/components/app/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Toaster />
        <Router>
          <AppRoutes />
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;

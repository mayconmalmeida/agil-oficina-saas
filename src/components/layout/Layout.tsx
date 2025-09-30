
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

const Layout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </ProtectedRoute>
  );
};

export default Layout;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PublicRoutes from '@/routes/PublicRoutes';
import AdminRoutes from '@/routes/AdminRoutes';
import ProtectedRoutes from '@/routes/ProtectedRoutes';
import PremiumRoutes from '@/routes/PremiumRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <PublicRoutes />

      {/* Admin routes */}
      <AdminRoutes />

      {/* Protected user routes */}
      <ProtectedRoutes />

      {/* Premium routes need to be nested inside the dashboard layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <PremiumRoutes />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { publicRoutes } from '@/routes/PublicRoutes';
import { adminRoutes } from '@/routes/AdminRoutes';
import { protectedRoutes } from '@/routes/ProtectedRoutes';
import { premiumRoutes } from '@/routes/PremiumRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes}

      {/* Admin routes */}
      {adminRoutes}

      {/* Protected user routes */}
      {protectedRoutes}

      {/* Premium routes need to be nested inside the dashboard layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {premiumRoutes}
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

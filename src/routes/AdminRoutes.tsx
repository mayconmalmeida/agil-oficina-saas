
import React from 'react';
import { Route } from 'react-router-dom';
import { AdminProvider } from '@/contexts/AdminContext';
import OptimizedAdminGuard from '@/components/admin/OptimizedAdminGuard';
import OptimizedAdminLayout from '@/components/layout/OptimizedAdminLayout';
import AdminLoginPage from '@/pages/AdminLoginPage';
import OptimizedAdminDashboard from '@/pages/OptimizedAdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminPlansPage from '@/pages/AdminPlansPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';

const AdminRoutes = () => {
  return (
    <>
      <Route
        path="/admin/login"
        element={
          <AdminProvider>
            <AdminLoginPage />
          </AdminProvider>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProvider>
            <OptimizedAdminGuard>
              <OptimizedAdminLayout />
            </OptimizedAdminGuard>
          </AdminProvider>
        }
      >
        <Route index element={<OptimizedAdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </>
  );
};

export default AdminRoutes;

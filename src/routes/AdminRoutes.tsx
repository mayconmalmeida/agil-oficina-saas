
import React from 'react';
import { Route } from 'react-router-dom';
import OptimizedAdminGuard from '@/components/admin/OptimizedAdminGuard';
import OptimizedAdminLayout from '@/components/layout/OptimizedAdminLayout';
import AdminLoginPage from '@/pages/AdminLoginPage';
import OptimizedAdminDashboard from '@/pages/OptimizedAdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminPlansPage from '@/pages/AdminPlansPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';

export const AdminRoutes = () => {
  return [
    <Route 
      key="admin-login" 
      path="/admin/login" 
      element={<AdminLoginPage />} 
    />,
    <Route
      key="admin-dashboard"
      path="/admin"
      element={
        <OptimizedAdminGuard>
          <OptimizedAdminLayout />
        </OptimizedAdminGuard>
      }
    >
      <Route index element={<OptimizedAdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="subscriptions" element={<AdminSubscriptions />} />
      <Route path="plans" element={<AdminPlansPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Route>
  ];
};

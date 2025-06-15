import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import OptimizedAdminLayout from '@/components/layout/OptimizedAdminLayout';

// Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import OptimizedAdminGuard from '@/components/admin/OptimizedAdminGuard';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import ServicesPage from '@/pages/ServicesPage';
import BudgetsPage from '@/pages/BudgetsPage';
import SchedulingPage from '@/pages/SchedulingPage';
import ProductsPage from '@/pages/ProductsPage';
import SettingsPage from '@/pages/SettingsPage';
import CompanyPage from '@/pages/CompanyPage';
import ProfilePage from '@/pages/ProfilePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import VehiclesPage from '@/pages/VehiclesPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';

// Admin Pages
import AdminLoginPage from '@/pages/AdminLoginPage';
import OptimizedAdminDashboard from '@/pages/OptimizedAdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminPlansPage from '@/pages/AdminPlansPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* CONTEXTO DE ADMIN SÓ NAS ROTAS /admin */}
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <AuthProvider>
                <HomePage />
              </AuthProvider>
            }
          />
          <Route
            path="/login"
            element={
              <AuthProvider>
                <LoginPage />
              </AuthProvider>
            }
          />
          <Route
            path="/register"
            element={
              <AuthProvider>
                <RegisterPage />
              </AuthProvider>
            }
          />

          {/* ADMIN ROUTES - SÓ ADMINPROVIDER */}
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

          {/* Protected user routes - SÓ AUTHPROVIDER */}
          <Route
            path="/dashboard"
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              </AuthProvider>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="veiculos" element={<VehiclesPage />} />
            <Route path="servicos" element={<ServicesPage />} />
            <Route path="orcamentos" element={<BudgetsPage />} />
            <Route path="agendamentos" element={<SchedulingPage />} />
            <Route path="produtos" element={<ProductsPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="empresa" element={<CompanyPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="assinatura" element={<SubscriptionPage />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

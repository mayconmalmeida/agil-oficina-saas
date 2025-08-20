
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LandingPage from '@/pages/LandingPage';
import SupportPage from '@/pages/SupportPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import AgendaPage from '@/pages/AgendaPage';
import ProdutosPage from '@/pages/ProdutosPage';
import OrcamentosPage from '@/pages/OrcamentosPage';
import NewOrcamentoPage from '@/pages/NewOrcamentoPage';
import OrdensServicoPage from '@/pages/OrdensServicoPage';
import NewOrdemServicoPage from '@/pages/NewOrdemServicoPage';
import OrdemServicoDetailPage from '@/pages/OrdemServicoDetailPage';
import FinanceiroPage from '@/pages/FinanceiroPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import SettingsPage from '@/pages/SettingsPage';

// Admin imports
import AdminLogin from '@/pages/AdminLogin';
import SimpleAdminDashboard from '@/pages/SimpleAdminDashboard';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from '@/pages/admin/AdminSubscriptionsPage';
import AdminPlansPage from '@/pages/admin/AdminPlansPage';
import OptimizedAdminGuard from '@/components/admin/OptimizedAdminGuard';

import LoadingScreen from '@/components/ui/loading';

const AppRoutes: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen fullscreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/esqueceu-senha" element={<ForgotPasswordPage />} />
      <Route path="/support" element={<SupportPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <OptimizedAdminGuard>
          <SimpleAdminDashboard />
        </OptimizedAdminGuard>
      } />
      <Route path="/admin/users" element={
        <OptimizedAdminGuard>
          <AdminUsersPage />
        </OptimizedAdminGuard>
      } />
      <Route path="/admin/subscriptions" element={
        <OptimizedAdminGuard>
          <AdminSubscriptionsPage />
        </OptimizedAdminGuard>
      } />
      <Route path="/admin/plans" element={
        <OptimizedAdminGuard>
          <AdminPlansPage />
        </OptimizedAdminGuard>
      } />

      {/* Private Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="orcamentos" element={<OrcamentosPage />} />
        <Route path="orcamentos/novo" element={<NewOrcamentoPage />} />
        <Route path="ordens-servico" element={<OrdensServicoPage />} />
        <Route path="ordens-servico/nova" element={<NewOrdemServicoPage />} />
        <Route path="ordens-servico/:id" element={<OrdemServicoDetailPage />} />
        <Route path="financeiro" element={<FinanceiroPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

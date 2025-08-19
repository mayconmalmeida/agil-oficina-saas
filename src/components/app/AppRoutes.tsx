
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SupportPage from '@/pages/SupportPage';
import DashboardPage from '@/pages/DashboardPage';
import Layout from '@/components/layout/Layout';
import OptimizedAdminGuard from '@/components/admin/OptimizedAdminGuard';
import AgendaPage from '@/pages/AgendaPage';
import OrdensServicoPage from '@/pages/OrdensServicoPage';
import OrdemServicoDetailPage from '@/pages/OrdemServicoDetailPage';
import FinanceiroPage from '@/pages/FinanceiroPage';

// Import pages from the correct routes structure
import ClientsPage from '@/pages/ClientsPage';
import ServicesPage from '@/pages/ServicesPage';
import BudgetsPage from '@/pages/BudgetsPage';
import ProductsPage from '@/pages/ProductsPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboard from '@/pages/AdminDashboard';

const AppRoutes: React.FC = () => {
  return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/support" element={<SupportPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={
            <OptimizedAdminGuard>
              <AdminDashboard />
            </OptimizedAdminGuard>
          } />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/orcamentos" element={<BudgetsPage />} />
            <Route path="/ordens-servico" element={<OrdensServicoPage />} />
            <Route path="/ordens-servico/:id" element={<OrdemServicoDetailPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
          </Route>
        </Routes>
  );
};

export default AppRoutes;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import PricingPage from '@/pages/PricingPage';
import SupportPage from '@/pages/SupportPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientesPage from '@/pages/ClientesPage';
import ServicosPage from '@/pages/ServicosPage';
import OrcamentosPage from '@/pages/OrcamentosPage';
import EstoquePage from '@/pages/EstoquePage';
import FinanceiroPage from '@/pages/FinanceiroPage';
import ColaboradoresPage from '@/pages/ColaboradoresPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import AjudaPage from '@/pages/AjudaPage';
import Layout from '@/components/layout/Layout';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import OptimizedAdminGuard from '@/components/auth/OptimizedAdminGuard';
import NovoAgendamentoPage from '@/pages/NovoAgendamentoPage';
import EditarAgendamentoPage from '@/pages/EditarAgendamentoPage';
import NovoClientePage from '@/pages/NovoClientePage';
import EditarClientePage from '@/pages/EditarClientePage';
import NovoServicoPage from '@/pages/NovoServicoPage';
import EditarServicoPage from '@/pages/EditarServicoPage';
import NovoOrcamentoPage from '@/pages/NovoOrcamentoPage';
import EditarOrcamentoPage from '@/pages/EditarOrcamentoPage';
import AgendaPage from '@/pages/AgendaPage';
import OrdensServicoPage from '@/pages/OrdensServicoPage';
import OrdemServicoDetailPage from '@/pages/OrdemServicoDetailPage';

const AppRoutes: React.FC = () => {
  return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
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
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/orcamentos" element={<OrcamentosPage />} />
            <Route path="/ordens-servico" element={<OrdensServicoPage />} />
            <Route path="/ordens-servico/:id" element={<OrdemServicoDetailPage />} />
            <Route path="/estoque" element={<EstoquePage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/colaboradores" element={<ColaboradoresPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="/ajuda" element={<AjudaPage />} />
            <Route path="/agendamentos/novo" element={<NovoAgendamentoPage />} />
            <Route path="/agendamentos/:id/editar" element={<EditarAgendamentoPage />} />
            <Route path="/clientes/novo" element={<NovoClientePage />} />
            <Route path="/clientes/:id/editar" element={<EditarClientePage />} />
            <Route path="/servicos/novo" element={<NovoServicoPage />} />
            <Route path="/servicos/:id/editar" element={<EditarServicoPage />} />
            <Route path="/orcamentos/novo" element={<NovoOrcamentoPage />} />
            <Route path="/orcamentos/:id/editar" element={<EditarOrcamentoPage />} />
          </Route>
        </Routes>
  );
};

export default AppRoutes;

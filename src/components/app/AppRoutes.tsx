
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import SupportPage from '@/pages/SupportPage';
import DashboardPage from '@/pages/DashboardPage';
import Layout from '@/components/layout/Layout';
import AgendaPage from '@/pages/AgendaPage';
import NewSchedulePage from '@/pages/NewSchedulePage';
import OrdemServicoPage from '@/pages/OrdemServicoPage';
import OrdemServicoDetailPage from '@/pages/OrdemServicoDetailPage';
import BudgetViewPage from '@/pages/BudgetViewPage';
import EditClientPage from '@/pages/EditClientPage';
import NewClientPage from '@/pages/NewClientPage';
import FinanceiroPage from '@/pages/FinanceiroPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import EditBudgetPage from '@/pages/EditBudgetPage';
import NewServiceOrderPage from '@/pages/NewServiceOrderPage';
import ClientsPage from '@/pages/ClientsPage';
import ServicesPage from '@/pages/ServicesPage';
import BudgetsPage from '@/pages/BudgetsPage';
import ProductsPage from '@/pages/ProductsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import SuppliersPage from '@/pages/SuppliersPage';
import SupplierEditPage from '@/pages/SupplierEditPage';
import ReportsPage from '@/pages/ReportsPage';
import CompanyPage from '@/pages/CompanyPage';
import SettingsPage from '@/pages/SettingsPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import CollaboratorsPage from '@/pages/CollaboratorsPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuportePage from '@/pages/IASuportePage';
import OrderDetailsPage from '@/pages/OrderDetailsPage';
import ProductEditPage from '@/pages/ProductEditPage';
import ServiceEditPage from '@/pages/ServiceEditPage';
import VehicleHistoryPublicPage from '@/pages/VehicleHistoryPublicPage';
import GenerateLabelPage from '@/pages/GenerateLabelPage';
import { AdminRoutes } from '@/routes/AdminRoutes';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/esqueceu-senha" element={<ForgotPasswordPage />} />
      <Route path="/support" element={<SupportPage />} />
      
      {/* Admin Routes */}
      {AdminRoutes()}

      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/agendamentos" element={<AgendaPage />} />
        <Route path="/agendamentos/novo" element={<NewSchedulePage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/:id/editar" element={<EditClientPage />} />
        <Route path="/dashboard/clientes" element={<ClientsPage />} />
        <Route path="/dashboard/clientes/novo" element={<NewClientPage />} />
        <Route path="/dashboard/clientes/:id/editar" element={<EditClientPage />} />
        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/servicos/:id" element={<ServiceEditPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/produtos/:id" element={<ProductEditPage />} />
        <Route path="/orcamentos" element={<BudgetsPage />} />
        <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
        <Route path="/orcamentos/:id" element={<BudgetViewPage />} />
        <Route path="/orcamentos/editar/:id" element={<EditBudgetPage />} />
        <Route path="/ordens-servico" element={<OrdemServicoPage />} />
        <Route path="/ordens-servico/nova" element={<NewServiceOrderPage />} />
        <Route path="/ordens-servico/:id" element={<OrdemServicoDetailPage />} />
        <Route path="/dashboard/ordens-servico" element={<OrdemServicoPage />} />
        <Route path="/dashboard/ordens-servico/:id" element={<OrderDetailsPage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
        
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        
        {/* Dashboard specific routes */}
        <Route path="/dashboard/produtos" element={<ProductsPage />} />
        <Route path="/dashboard/categorias" element={<CategoriesPage />} />
        <Route path="/dashboard/fornecedores" element={<SuppliersPage />} />
        <Route path="/dashboard/fornecedores/:id" element={<SupplierEditPage />} />
        <Route path="/dashboard/orcamentos" element={<BudgetsPage />} />
        <Route path="/dashboard/orcamentos/novo" element={<NewBudgetPage />} />
        <Route path="/dashboard/orcamentos/:id" element={<BudgetViewPage />} />
        <Route path="/dashboard/orcamentos/editar/:id" element={<EditBudgetPage />} />
        <Route path="/dashboard/relatorios" element={<ReportsPage />} />
        <Route path="/dashboard/empresa" element={<CompanyPage />} />
        <Route path="/dashboard/configuracoes" element={<SettingsPage />} />
        <Route path="/dashboard/assinatura" element={<SubscriptionPage />} />
        
        <Route path="/dashboard/ia-diagnostico" element={<IADiagnosticoPage />} />
        <Route path="/dashboard/ia-suporte-inteligente" element={<IASuportePage />} />
        <Route path="/dashboard/gerar-etiqueta" element={<GenerateLabelPage />} />
        <Route path="/dashboard/financeiro" element={<FinanceiroPage />} />
      </Route>
      
      {/* Rota pública para histórico de veículos via QR Code */}
      <Route path="/historico/:placa" element={<VehicleHistoryPublicPage />} />
    </Routes>
  );
};

export default AppRoutes;

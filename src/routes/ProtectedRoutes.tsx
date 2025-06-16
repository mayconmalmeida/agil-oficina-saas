
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import NewClientPage from '@/pages/NewClientPage';
import ServicesPage from '@/pages/ServicesPage';
import ServicesListPage from '@/pages/ServicesListPage';
import BudgetsPage from '@/pages/BudgetsPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import BudgetDetailsPage from '@/pages/BudgetDetailsPage';
import SchedulesPage from '@/pages/SchedulesPage';
import NewSchedulePage from '@/pages/NewSchedulePage';
import SchedulingPage from '@/pages/SchedulingPage';
import ProductsPage from '@/pages/ProductsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import SuppliersPage from '@/pages/SuppliersPage';
import SettingsPage from '@/pages/SettingsPage';
import CompanyPage from '@/pages/CompanyPage';
import ProfilePage from '@/pages/ProfilePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import VehiclesPage from '@/pages/VehiclesPage';
import RelatoriosBasicosPage from '@/pages/RelatoriosBasicosPage';
import RelatoriosAvancadosPage from '@/pages/RelatoriosAvancadosPage';

export const protectedRoutes = [
  <Route
    key="dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<DashboardPage />} />
    <Route path="clientes" element={<ClientsPage />} />
    <Route path="clientes/novo" element={<NewClientPage />} />
    <Route path="veiculos" element={<VehiclesPage />} />
    <Route path="servicos" element={<ServicesListPage />} />
    <Route path="servicos/novo" element={<ServicesPage />} />
    <Route path="orcamentos" element={<BudgetsPage />} />
    <Route path="orcamentos/novo" element={<NewBudgetPage />} />
    <Route path="orcamentos/:id" element={<BudgetDetailsPage />} />
    <Route path="agendamentos" element={<SchedulesPage />} />
    <Route path="agendamentos/novo" element={<NewSchedulePage />} />
    <Route 
      path="agendamento-premium" 
      element={
        <SubscriptionGuard requiredPlan="premium">
          <SchedulingPage />
        </SubscriptionGuard>
      } 
    />
    <Route path="produtos" element={<ProductsPage />} />
    <Route path="categorias" element={<CategoriesPage />} />
    <Route path="fornecedores" element={<SuppliersPage />} />
    <Route path="configuracoes" element={<SettingsPage />} />
    <Route path="empresa" element={<CompanyPage />} />
    <Route path="perfil" element={<ProfilePage />} />
    <Route path="assinatura" element={<SubscriptionPage />} />
    <Route path="relatorios-basicos" element={<RelatoriosBasicosPage />} />
    <Route path="relatorios-avancados" element={<RelatoriosAvancadosPage />} />
  </Route>
];

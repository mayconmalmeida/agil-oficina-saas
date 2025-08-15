
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlanExpiredGuard from '@/components/subscription/PlanExpiredGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientsPage from '@/pages/ClientsPage';
import NewClientPage from '@/pages/NewClientPage';
import EditClientPage from '@/pages/EditClientPage';
import BudgetsPage from '@/pages/BudgetsPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import ServicesPage from '@/pages/ServicesPage';
import ProductsPage from '@/pages/ProductsPage';
import VehiclesPage from '@/pages/VehiclesPage';
import AgendamentosPage from '@/pages/AgendamentosPage';
import NewSchedulePage from '@/pages/NewSchedulePage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuportePage from '@/pages/IASuportePage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import AssinaturaPage from '@/pages/AssinaturaPage';

export const protectedRoutes = [
  <Route key="dashboard-layout" path="/dashboard/*" element={
    <ProtectedRoute>
      <PlanExpiredGuard>
        <DashboardLayout />
      </PlanExpiredGuard>
    </ProtectedRoute>
  }>
    <Route path="clientes" element={<ClientsPage />} />
    <Route path="clientes/novo" element={<NewClientPage />} />
    <Route path="clientes/:id/editar" element={<EditClientPage />} />
    <Route path="orcamentos" element={<BudgetsPage />} />
    <Route path="orcamentos/novo" element={<NewBudgetPage />} />
    <Route path="servicos" element={<ServicesPage />} />
    <Route path="produtos" element={<ProductsPage />} />
    <Route path="veiculos" element={<VehiclesPage />} />
    <Route path="agendamentos" element={<AgendamentosPage />} />
    <Route path="agendamentos/novo" element={<NewSchedulePage />} />
    <Route path="ia-diagnostico" element={<IADiagnosticoPage />} />
    <Route path="ia-suporte-inteligente" element={<IASuportePage />} />
    <Route path="relatorios" element={<RelatoriosPage />} />
    <Route path="configuracoes" element={<ConfiguracoesPage />} />
    <Route path="assinatura" element={<AssinaturaPage />} />
  </Route>
];

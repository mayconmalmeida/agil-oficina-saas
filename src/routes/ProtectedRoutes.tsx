
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlanExpiredGuard from '@/components/subscription/PlanExpiredGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientsPage from '@/pages/ClientsPage';
import ServicesPage from '@/pages/ServicesPage';
import VehiclesPage from '@/pages/VehiclesPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import BudgetsPage from '@/pages/BudgetsPage';
import SchedulingPage from '@/pages/SchedulingPage';
import AISupportPage from '@/pages/AISupportPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import RelatoriosPage from '@/pages/RelatoriosPage';

export const protectedRoutes = (
  <>
    {/* Dashboard Routes */}
    <Route path="/dashboard/*" element={
      <ProtectedRoute>
        <PlanExpiredGuard>
          <DashboardLayout />
        </PlanExpiredGuard>
      </ProtectedRoute>
    }>
      {/* Clients */}
      <Route path="clientes" element={<ClientsPage />} />
      
      {/* Services */}
      <Route path="servicos" element={<ServicesPage />} />
      
      {/* Vehicles */}
      <Route path="veiculos" element={<VehiclesPage />} />
      
      {/* Budgets */}
      <Route path="orcamentos" element={<BudgetsPage />} />
      <Route path="orcamentos/novo" element={<NewBudgetPage />} />
      
      {/* Scheduling */}
      <Route path="agendamentos/novo" element={<SchedulingPage />} />
      
      {/* New Routes */}
      <Route path="ia-suporte" element={<AISupportPage />} />
      <Route path="configuracoes" element={<ConfiguracoesPage />} />
      <Route path="relatorios" element={<RelatoriosPage />} />
    </Route>
  </>
);

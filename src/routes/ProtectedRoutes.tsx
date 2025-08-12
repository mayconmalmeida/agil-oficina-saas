
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlanExpiredGuard from '@/components/subscription/PlanExpiredGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ClientsPage from '@/pages/ClientsPage';
import AddClientPage from '@/pages/AddClientPage';
import EditClientPage from '@/pages/EditClientPage';
import ServicesPage from '@/pages/ServicesPage';
import AddServicePage from '@/pages/AddServicePage';
import EditServicePage from '@/pages/EditServicePage';
import VehiclesPage from '@/pages/VehiclesPage';
import AddVehiclePage from '@/pages/AddVehiclePage';
import EditVehiclePage from '@/pages/EditVehiclePage';
import BudgetListPage from '@/pages/BudgetListPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import EditBudgetPage from '@/pages/EditBudgetPage';
import SchedulingPage from '@/pages/SchedulingPage';
import SchedulingListPage from '@/pages/SchedulingListPage';
import EstoquePage from '@/pages/EstoquePage';
import NotasFiscaisPage from '@/pages/NotasFiscaisPage';
import FornecedoresPage from '@/pages/FornecedoresPage';
import CampanhasMarketingPage from '@/pages/CampanhasMarketingPage';
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
      <Route path="clientes/novo" element={<AddClientPage />} />
      <Route path="clientes/:id/editar" element={<EditClientPage />} />
      
      {/* Services */}
      <Route path="servicos" element={<ServicesPage />} />
      <Route path="servicos/novo" element={<AddServicePage />} />
      <Route path="servicos/:id/editar" element={<EditServicePage />} />
      
      {/* Vehicles */}
      <Route path="veiculos" element={<VehiclesPage />} />
      <Route path="veiculos/novo" element={<AddVehiclePage />} />
      <Route path="veiculos/:id/editar" element={<EditVehiclePage />} />
      
      {/* Budgets */}
      <Route path="orcamentos" element={<BudgetListPage />} />
      <Route path="orcamentos/novo" element={<NewBudgetPage />} />
      <Route path="orcamentos/:id/editar" element={<EditBudgetPage />} />
      
      {/* Scheduling */}
      <Route path="agendamentos" element={<SchedulingListPage />} />
      <Route path="agendamentos/novo" element={<SchedulingPage />} />
      
      {/* Inventory */}
      <Route path="estoque" element={<EstoquePage />} />
      
      {/* Financial */}
      <Route path="notas-fiscais" element={<NotasFiscaisPage />} />
      <Route path="fornecedores" element={<FornecedoresPage />} />
      
      {/* Marketing */}
      <Route path="campanhas" element={<CampanhasMarketingPage />} />
      
      {/* New Routes */}
      <Route path="ia-suporte" element={<AISupportPage />} />
      <Route path="configuracoes" element={<ConfiguracoesPage />} />
      <Route path="relatorios" element={<RelatoriosPage />} />
    </Route>
  </>
);

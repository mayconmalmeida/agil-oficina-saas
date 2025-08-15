import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import BudgetsPage from '@/pages/BudgetsPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import BudgetDetailsPage from '@/pages/BudgetDetailsPage';
import BudgetEditPage from '@/pages/BudgetEditPage';
import ServicesPage from '@/pages/ServicesPage';
import ProductsPage from '@/pages/ProductsPage';
import VehiclesPage from '@/pages/VehiclesPage';
import SchedulingPage from '@/pages/SchedulingPage';
import FornecedoresPage from '@/pages/FornecedoresPage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuporteInteligentePage from '@/pages/IASuporteInteligentePage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import AssinaturaPage from '@/pages/AssinaturaPage';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UsersPage from '@/pages/admin/UsersPage';
import SubscriptionsPage from '@/pages/admin/SubscriptionsPage';
import PlansPage from '@/pages/admin/PlansPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import OrdemServicoPage from '@/pages/OrdemServicoPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="orcamentos" element={<BudgetsPage />} />
          <Route path="orcamentos/novo" element={<NewBudgetPage />} />
          <Route path="orcamentos/:id" element={<BudgetDetailsPage />} />
          <Route path="orcamentos/editar/:id" element={<BudgetEditPage />} />
          <Route path="ordem-servico" element={<OrdemServicoPage />} />
          <Route path="servicos" element={<ServicesPage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="veiculos" element={<VehiclesPage />} />
          <Route path="agendamentos" element={<SchedulingPage />} />
          <Route path="fornecedores" element={<FornecedoresPage />} />
          <Route path="ia-diagnostico" element={<IADiagnosticoPage />} />
          <Route path="ia-suporte-inteligente" element={<IASuporteInteligentePage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="assinatura" element={<AssinaturaPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

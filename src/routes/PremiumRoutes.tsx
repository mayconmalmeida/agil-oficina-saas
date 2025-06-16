
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import NewClientPage from '@/pages/NewClientPage';
import ProductsPage from '@/pages/ProductsPage';
import ServicesPage from '@/pages/ServicesPage';
import BudgetsPage from '@/pages/BudgetsPage';
import BudgetPage from '@/pages/BudgetPage';
import BudgetDetailsPage from '@/pages/BudgetDetailsPage';
import BudgetEditPage from '@/pages/BudgetEditPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import SchedulesPage from '@/pages/SchedulesPage';
import SchedulingPage from '@/pages/SchedulingPage';
import MarketingPage from '@/pages/MarketingPage';
import ContabilidadePage from '@/pages/ContabilidadePage';
import CategoriesPage from '@/pages/CategoriesPage';
import SuppliersPage from '@/pages/SuppliersPage';
import RelatoriosBasicosPage from '@/pages/RelatoriosBasicosPage';
import RelatoriosAvancadosPage from '@/pages/RelatoriosAvancadosPage';
import IntegracaoContabilPage from '@/pages/IntegracaoContabilPage';
import IASuporteInteligentePage from '@/pages/IASuporteInteligentePage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import VehiclesPage from '@/pages/VehiclesPage';
import NewVehiclePage from '@/pages/NewVehiclePage';
import VehicleRegistrationPage from '@/pages/VehicleRegistrationPage';
import BackupPage from '@/pages/BackupPage';
import CompanyPage from '@/pages/CompanyPage';
import CompanyProfilePage from '@/pages/CompanyProfilePage';
import SettingsPage from '@/pages/SettingsPage';

export const premiumRoutes = [
  <Route key="dashboard-home" index element={<DashboardPage />} />,
  <Route key="clients" path="clientes" element={<ClientsPage />} />,
  <Route key="new-client" path="clientes/novo" element={<NewClientPage />} />,
  <Route key="products" path="produtos" element={<ProductsPage />} />,
  <Route key="services" path="servicos" element={<ServicesPage />} />,
  <Route key="budgets" path="orcamentos" element={<BudgetsPage />} />,
  <Route key="budget" path="orcamento" element={<BudgetPage />} />,
  <Route key="budget-details" path="orcamentos/:id" element={<BudgetDetailsPage />} />,
  <Route key="budget-edit" path="orcamentos/:id/editar" element={<BudgetEditPage />} />,
  <Route key="new-budget" path="orcamentos/novo" element={<NewBudgetPage />} />,
  <Route key="schedules" path="agendamentos" element={<SchedulesPage />} />,
  <Route key="scheduling" path="agendamentos/novo" element={<SchedulingPage />} />,
  <Route key="marketing" path="marketing" element={<MarketingPage />} />,
  <Route key="contabilidade" path="contabilidade" element={<ContabilidadePage />} />,
  <Route key="categories" path="categorias" element={<CategoriesPage />} />,
  <Route key="suppliers" path="fornecedores" element={<SuppliersPage />} />,
  <Route key="reports-basic" path="relatorios-basicos" element={<RelatoriosBasicosPage />} />,
  <Route key="reports-advanced" path="relatorios-avancados" element={<RelatoriosAvancadosPage />} />,
  <Route key="accounting" path="integracao-contabil" element={<IntegracaoContabilPage />} />,
  <Route key="ai-support" path="ia-suporte" element={<IASuporteInteligentePage />} />,
  <Route key="ai-diagnostic" path="ia-diagnostico" element={<IADiagnosticoPage />} />,
  <Route key="vehicles" path="veiculos" element={<VehiclesPage />} />,
  <Route key="new-vehicle" path="veiculos/novo" element={<NewVehiclePage />} />,
  <Route key="vehicle-registration" path="cadastro-veiculo" element={<VehicleRegistrationPage />} />,
  <Route key="backup" path="backup" element={<BackupPage />} />,
  <Route key="company" path="empresa" element={<CompanyPage />} />,
  <Route key="company-profile" path="perfil-empresa" element={<CompanyProfilePage />} />,
  <Route key="settings" path="configuracoes" element={<SettingsPage />} />
];

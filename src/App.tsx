import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEnsureDatabaseSchema } from './hooks/useEnsureDatabaseSchema';
import { Toaster } from './components/ui/toaster';

// Pages
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserDashboard from './pages/UserDashboard';
import Dashboard from './pages/Dashboard';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ClientsPage from './pages/ClientsPage';
import ServicesPage from './pages/ServicesPage';
import ServicesListPage from './pages/ServicesListPage';
import BudgetPage from './pages/BudgetPage';
import NewBudgetPage from './pages/NewBudgetPage';
import BudgetEditPage from './pages/BudgetEditPage';
import BudgetDetailsPage from './pages/BudgetDetailsPage';
import ProfileEditPage from './pages/ProfileEditPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSubscriptions from './pages/AdminSubscriptions';
import NotFound from './pages/NotFound';
import WorkshopRegistrationPage from './pages/WorkshopRegistrationPage';
import SchedulingPage from './pages/SchedulingPage';
import SchedulesPage from './pages/SchedulesPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import ProductsPage from './pages/ProductsPage';
import ClientsManagementPage from './pages/ClientsManagementPage';
import ClientManagementPage from './pages/ClientManagementPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleRegistrationPage from './pages/VehicleRegistrationPage';
import ThankYouPage from './pages/ThankYouPage';
import DashboardLayout from './components/layout/DashboardLayout';

import './App.css';
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './components/admin/AdminLayout';
import UsersSubscriptionsPage from './pages/admin/UsersSubscriptionsPage';
import SaaSReportsPage from './pages/admin/SaaSReportsPage';
import CampaignsPage from './pages/admin/CampaignsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  // Ensure the database schema is created
  useEnsureDatabaseSchema();

  return (
    <BrowserRouter>
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/cadastro-oficina" element={<WorkshopRegistrationPage />} />
        <Route path="/workshop-registration" element={<WorkshopRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users-subscriptions" element={<UsersSubscriptionsPage />} />
          <Route path="reports-saas" element={<SaaSReportsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
        </Route>
        
        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<ClientManagementPage />} />
          <Route path="/veiculos" element={<VehiclesPage />} />
          <Route path="/veiculos/novo" element={<VehicleRegistrationPage />} />
          <Route path="/veiculos/novo/:clientId" element={<VehicleRegistrationPage />} />
          <Route path="/veiculos/:vehicleId" element={<VehicleRegistrationPage />} />
          <Route path="/veiculos/editar/:vehicleId" element={<VehicleRegistrationPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/servicos/lista" element={<ServicesListPage />} />
          <Route path="/agendamentos" element={<SchedulesPage />} />
          <Route path="/agendamentos/novo" element={<NewAppointmentPage />} />
          <Route path="/orcamentos" element={<BudgetPage />} />
          <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
          <Route path="/orcamentos/editar/:id" element={<BudgetEditPage />} />
          <Route path="/orcamentos/:id" element={<BudgetDetailsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
        
        {/* Routes outside the dashboard layout */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/setup" element={<ProfileSetupPage />} />
        <Route path="/adicionar-clientes" element={<ClientsPage />} />
        <Route path="/agendamento" element={<SchedulingPage />} />
        <Route path="/profile" element={<ProfileEditPage />} />
        <Route path="/company" element={<CompanyProfilePage />} />
        <Route path="/clientes-gestao" element={<ClientsManagementPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        
        {/* 404 - Keep this as the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEnsureDatabaseSchema } from './hooks/useEnsureDatabaseSchema';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

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
import ProductsPage from './pages/ProductsPage';
import ClientsManagementPage from './pages/ClientsManagementPage';
import ClientManagementPage from './pages/ClientManagementPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleRegistrationPage from './pages/VehicleRegistrationPage';
import ThankYouPage from './pages/ThankYouPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ServicesListPage from '@/pages/ServicesListPage';
import NewAppointmentPage from '@/pages/NewAppointmentPage';

import './App.css';

function App() {
  // Ensure the database schema is created
  useEnsureDatabaseSchema();

  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          
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
            <Route path="/agendamentos" element={<SchedulesPage />} />
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
          <Route path="/workshop-registration" element={<WorkshopRegistrationPage />} />
          <Route path="/clientes-gestao" element={<ClientsManagementPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          
          {/* Service routes */}
          <Route path="/servicos" element={<ServicesListPage />} />
          <Route path="/servicos/novo" element={<ServicesPage />} />
          
          {/* Appointment routes */}
          <Route path="/agendamentos/novo" element={<NewAppointmentPage />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

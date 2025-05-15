
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useToast } from '@/hooks/use-toast';

import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UserDashboard from './pages/UserDashboard';
import Dashboard from './pages/Dashboard';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ClientsPage from './pages/ClientsPage';
import ClientManagementPage from './pages/ClientManagementPage';
import ServicesPage from './pages/ServicesPage';
import ProductsPage from './pages/ProductsPage';
import NewBudgetPage from './pages/NewBudgetPage';
import BudgetPage from './pages/BudgetPage';
import ProfileEditPage from './pages/ProfileEditPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import WorkshopRegistrationPage from './pages/WorkshopRegistrationPage';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

// New pages
import SettingsPage from './pages/SettingsPage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleRegistrationPage from './pages/VehicleRegistrationPage';
import SchedulingPage from './pages/SchedulingPage';
import SchedulesPage from './pages/SchedulesPage';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminRegister from './pages/AdminRegister';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/esqueceu-senha" element={<ForgotPasswordPage />} />
        <Route path="/cadastro-oficina" element={<WorkshopRegistrationPage />} />
        
        {/* Onboarding routes */}
        <Route path="/onboarding/profile" element={<ProfileSetupPage />} />
        <Route path="/onboarding/clientes" element={<ClientsPage />} />
        <Route path="/onboarding/produtos-servicos" element={<ServicesPage />} />
        <Route path="/onboarding/orcamento" element={<NewBudgetPage />} />
        
        {/* Protected dashboard routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/clientes" element={<ClientManagementPage />} />
          <Route path="/clientes/novo" element={<ClientManagementPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produtos/novo" element={<ProductsPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/orcamentos" element={<BudgetPage />} />
          <Route path="/orcamentos/novo" element={<BudgetPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/configuracoes/oficina" element={<CompanyProfilePage />} />
          <Route path="/perfil/editar" element={<ProfileEditPage />} />
          <Route path="/empresa/perfil" element={<CompanyProfilePage />} />
          <Route path="/veiculos" element={<VehiclesPage />} />
          <Route path="/veiculos/novo" element={<VehicleRegistrationPage />} />
          <Route path="/agendamentos" element={<SchedulesPage />} />
          <Route path="/agendamentos/novo" element={<SchedulingPage />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;

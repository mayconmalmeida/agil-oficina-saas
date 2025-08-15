import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import ServicesPage from '@/pages/ServicesPage';
import BudgetsPage from '@/pages/BudgetsPage';
import SchedulingPage from '@/pages/SchedulingPage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuportePage from '@/pages/IASuportePage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import AssinaturaPage from '@/pages/AssinaturaPage';
import OrdemServicoPage from '@/pages/OrdemServicoPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminPlansPage from '@/pages/AdminPlansPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminLayout from '@/components/layout/AdminLayout';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import IASuporteInteligentePage from '@/pages/IASuporteInteligentePage';

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="scheduling" element={<SchedulingPage />} />
            <Route path="ia-diagnostico" element={<IADiagnosticoPage />} />
            <Route path="ia-suporte" element={<IASuportePage />} />
            <Route path="ia-suporte-inteligente" element={<IASuporteInteligentePage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="assinatura" element={<AssinaturaPage />} />
            <Route path="ordem-servico" element={<OrdemServicoPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

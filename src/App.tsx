import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientManagementPage from '@/pages/ClientManagementPage';
import ServicesListPage from '@/pages/ServicesListPage';
import NewServicePage from '@/pages/NewServicePage';
import EditServicePage from '@/pages/EditServicePage';
import BudgetListPage from '@/pages/BudgetListPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import EditBudgetPage from '@/pages/EditBudgetPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import NewAppointmentPage from '@/pages/NewAppointmentPage';
import { ThemeProvider } from '@/components/theme-provider';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientManagementPage />} />
            <Route path="/servicos" element={<ServicesListPage />} />
            <Route path="/servicos/novo" element={<NewServicePage />} />
            <Route path="/servicos/editar/:id" element={<EditServicePage />} />
            <Route path="/orcamentos" element={<BudgetListPage />} />
            <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
            <Route path="/orcamentos/editar/:id" element={<EditBudgetPage />} />
            <Route path="/agendamentos" element={<AppointmentsPage />} />
            <Route path="/agendamentos/novo" element={<NewAppointmentPage />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

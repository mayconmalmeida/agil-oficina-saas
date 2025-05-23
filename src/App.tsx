
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientsManagementPage from '@/pages/ClientsManagementPage';
import ServicesListPage from '@/pages/ServicesListPage';
import NewAppointmentPage from '@/pages/NewAppointmentPage';
import DashboardPage from '@/pages/DashboardPage';
import NewServicePage from '@/pages/NewServicePage';
import EditServicePage from '@/pages/EditServicePage';
import BudgetListPage from '@/pages/BudgetListPage';
import EditBudgetPage from '@/pages/EditBudgetPage';
import AppointmentsPage from '@/pages/AppointmentsPage';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientsManagementPage />} />
              <Route path="/servicos" element={<ServicesListPage />} />
              <Route path="/servicos/novo" element={<NewServicePage />} />
              <Route path="/servicos/editar/:id" element={<EditServicePage />} />
              <Route path="/orcamentos" element={<BudgetListPage />} />
              <Route path="/orcamentos/novo" element={<div>New Budget Page</div>} />
              <Route path="/orcamentos/editar/:id" element={<EditBudgetPage />} />
              <Route path="/agendamentos" element={<AppointmentsPage />} />
              <Route path="/agendamentos/novo" element={<NewAppointmentPage />} />
            </Routes>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

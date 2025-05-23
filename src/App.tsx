
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientsManagementPage from '@/pages/ClientsManagementPage';
import ServicesListPage from '@/pages/ServicesListPage';
import NewAppointmentPage from '@/pages/NewAppointmentPage';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard Page</div>} />
            <Route path="/clientes" element={<ClientsManagementPage />} />
            <Route path="/servicos" element={<ServicesListPage />} />
            <Route path="/servicos/novo" element={<div>New Service Page</div>} />
            <Route path="/servicos/editar/:id" element={<div>Edit Service Page</div>} />
            <Route path="/orcamentos" element={<div>Budget List Page</div>} />
            <Route path="/orcamentos/novo" element={<div>New Budget Page</div>} />
            <Route path="/orcamentos/editar/:id" element={<div>Edit Budget Page</div>} />
            <Route path="/agendamentos" element={<div>Appointments Page</div>} />
            <Route path="/agendamentos/novo" element={<NewAppointmentPage />} />
          </Routes>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

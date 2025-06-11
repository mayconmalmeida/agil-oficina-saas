import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import ProfileSetupPage from '@/pages/ProfileSetupPage';
import ProfileEditPage from '@/pages/ProfileEditPage';
import WorkshopRegistrationPage from '@/pages/WorkshopRegistrationPage';
import ThankYouPage from '@/pages/ThankYouPage';
import ClientsPage from '@/pages/ClientsPage';
import ProductsPage from '@/pages/ProductsPage';
import ServicesListPage from '@/pages/ServicesListPage';
import VehiclesPage from '@/pages/VehiclesPage';
import VehicleRegistrationPage from '@/pages/VehicleRegistrationPage';
import BudgetPage from '@/pages/BudgetPage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import BudgetDetailsPage from '@/pages/BudgetDetailsPage';
import BudgetEditPage from '@/pages/BudgetEditPage';
import SchedulingPage from '@/pages/SchedulingPage';
import NewAppointmentPage from '@/pages/NewAppointmentPage';
import SettingsPage from '@/pages/SettingsPage';
import CompanyProfilePage from '@/pages/CompanyProfilePage';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminRegister from '@/pages/AdminRegister';
import OptimizedAdminDashboard from '@/pages/OptimizedAdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminPlansPage from '@/pages/AdminPlansPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OptimizedAdminLayout from '@/components/layout/OptimizedAdminLayout';
import OptimizedAdminGuard from '@/components/admin/OptimizedAdminGuard';
import { AdminProvider } from '@/contexts/AdminContext';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/workshop-registration" element={<WorkshopRegistrationPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/profile-edit" element={<ProfileEditPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            
            {/* Dashboard routes with layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/clientes" element={<DashboardLayout />}>
              <Route index element={<ClientsPage />} />
            </Route>
            <Route path="/produtos" element={<DashboardLayout />}>
              <Route index element={<ProductsPage />} />
            </Route>
            <Route path="/servicos" element={<DashboardLayout />}>
              <Route index element={<ServicesListPage />} />
            </Route>
            <Route path="/veiculos" element={<DashboardLayout />}>
              <Route index element={<VehiclesPage />} />
            </Route>
            <Route path="/veiculos/novo" element={<DashboardLayout />}>
              <Route index element={<VehicleRegistrationPage />} />
            </Route>
            <Route path="/orcamentos" element={<DashboardLayout />}>
              <Route index element={<BudgetPage />} />
            </Route>
            <Route path="/orcamentos/novo" element={<DashboardLayout />}>
              <Route index element={<NewBudgetPage />} />
            </Route>
            <Route path="/orcamentos/:id" element={<DashboardLayout />}>
              <Route index element={<BudgetDetailsPage />} />
            </Route>
            <Route path="/orcamentos/:id/editar" element={<DashboardLayout />}>
              <Route index element={<BudgetEditPage />} />
            </Route>
            <Route path="/agendamentos" element={<DashboardLayout />}>
              <Route index element={<SchedulingPage />} />
            </Route>
            <Route path="/agendamentos/novo" element={<DashboardLayout />}>
              <Route index element={<NewAppointmentPage />} />
            </Route>
            <Route path="/configuracoes" element={<DashboardLayout />}>
              <Route index element={<SettingsPage />} />
            </Route>
            <Route path="/empresa" element={<DashboardLayout />}>
              <Route index element={<CompanyProfilePage />} />
            </Route>

            {/* Admin routes with protection and layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin" element={
              <AdminProvider>
                <OptimizedAdminGuard>
                  <OptimizedAdminLayout />
                </OptimizedAdminGuard>
              </AdminProvider>
            }>
              <Route index element={<OptimizedAdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="plans" element={<AdminPlansPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

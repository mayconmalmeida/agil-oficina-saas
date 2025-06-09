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
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminSubscriptions from '@/pages/AdminSubscriptions';
import AdminPlansPage from '@/pages/AdminPlansPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/profile-edit" element={<ProfileEditPage />} />
            <Route path="/workshop-registration" element={<WorkshopRegistrationPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/servicos" element={<ServicesListPage />} />
            <Route path="/veiculos" element={<VehiclesPage />} />
            <Route path="/veiculos/novo" element={<VehicleRegistrationPage />} />
            <Route path="/orcamentos" element={<BudgetPage />} />
            <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
            <Route path="/orcamentos/:id" element={<BudgetDetailsPage />} />
            <Route path="/orcamentos/:id/editar" element={<BudgetEditPage />} />
            <Route path="/agendamentos" element={<SchedulingPage />} />
            <Route path="/agendamentos/novo" element={<NewAppointmentPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/empresa" element={<CompanyProfilePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

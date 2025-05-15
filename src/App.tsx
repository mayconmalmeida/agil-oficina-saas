
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import Dashboard from "./pages/Dashboard"; // Add the new Dashboard import
import ProfileSetupPage from "./pages/ProfileSetupPage";
import ClientsPage from "./pages/ClientsPage";
import ServicesPage from "./pages/ServicesPage";
import NewBudgetPage from "./pages/NewBudgetPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Create a new queryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/esqueceu-senha" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Update to use new Dashboard */}
          <Route path="/dashboard-legacy" element={<UserDashboard />} /> {/* Keep old dashboard as legacy */}
          <Route path="/perfil-oficina" element={<ProfileSetupPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/produtos-servicos" element={<ServicesPage />} />
          <Route path="/orcamento" element={<NewBudgetPage />} />
          <Route path="/orcamentos/novo" element={<NewBudgetPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';

// Pages
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ClientsPage from "@/pages/ClientsPage";
import ServicesPage from "@/pages/ServicesPage";
import ProductsPage from "@/pages/ProductsPage";
import BudgetsPage from "@/pages/BudgetsPage";
import ReportsPage from "@/pages/ReportsPage";
import ProfilePage from "@/pages/ProfilePage";
import SchedulePage from "@/pages/SchedulePage";
import IASupportPage from "@/pages/IASupportPage";

// Components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminGuard from "@/components/auth/AdminGuard";
import AppLayout from "@/components/layout/AppLayout";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route 
                path="/admin" 
                element={
                  <AdminGuard>
                    <AdminDashboardPage />
                  </AdminGuard>
                } 
              />
              
              {/* Protected routes with layout */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/clientes" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ClientsPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/servicos" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ServicesPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/produtos" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProductsPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orcamentos/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BudgetsPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/relatorios" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ReportsPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agendamentos" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SchedulePage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ia-suporte-inteligente" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <IASupportPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
          </Router>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

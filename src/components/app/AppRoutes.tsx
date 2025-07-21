
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlanExpiredGuard from '@/components/subscription/PlanExpiredGuard';
import AdminRoutes from '@/routes/AdminRoutes';
import UserDashboard from '@/pages/UserDashboard';
import PlanoExpirado from '@/pages/plano-expirado';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

const AppRoutes: React.FC = () => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/plano-expirado" element={<PlanoExpirado />} />
      
      {/* Rotas administrativas */}
      <Route path="/admin/*" element={<AdminRoutes />} />
      
      {/* Rotas protegidas com verificação de plano */}
      <Route path="/" element={
        <ProtectedRoute>
          <PlanExpiredGuard>
            <UserDashboard />
          </PlanExpiredGuard>
        </ProtectedRoute>
      } />
      
      {/* Redirecionar qualquer rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

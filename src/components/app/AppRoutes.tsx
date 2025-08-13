
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlanExpiredGuard from '@/components/subscription/PlanExpiredGuard';
import { AdminRoutes } from '@/routes/AdminRoutes';
import { publicRoutes } from '@/routes/PublicRoutes';
import { protectedRoutes } from '@/routes/ProtectedRoutes';
import UserDashboard from '@/pages/UserDashboard';
import PlanoExpirado from '@/pages/plano-expirado';

const AppRoutes: React.FC = () => {
  const { user, isLoadingAuth, isAdmin } = useAuth();

  console.log('AppRoutes: Estado atual', {
    hasUser: !!user,
    isAdmin,
    isLoadingAuth,
    userEmail: user?.email
  });

  if (isLoadingAuth) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      {/* Rotas públicas sempre disponíveis */}
      {publicRoutes}
      
      {/* Rota especial para plano expirado */}
      <Route path="/plano-expirado" element={<PlanoExpirado />} />
      
      {/* Rotas administrativas */}
      <AdminRoutes />
      
      {/* Rotas protegidas */}
      {protectedRoutes}
      
      {/* Rota protegida para dashboard do usuário */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PlanExpiredGuard>
            <UserDashboard />
          </PlanExpiredGuard>
        </ProtectedRoute>
      } />
      
      {/* Rota raiz - redirecionamento simples sem loops */}
      <Route path="/" element={
        user ? (
          isAdmin ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        ) : (
          <Navigate to="/home" replace />
        )
      } />
      
      {/* Redirecionar qualquer rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

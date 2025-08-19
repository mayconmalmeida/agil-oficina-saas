
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminContext } from '@/contexts/AdminContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlanExpiredGuard from '@/components/subscription/PlanExpiredGuard';
import { AdminRoutes } from '@/routes/AdminRoutes';
import { publicRoutes } from '@/routes/PublicRoutes';
import { protectedRoutes } from '@/routes/ProtectedRoutes';
import DashboardPage from '@/pages/DashboardPage';
import PlanoExpirado from '@/pages/plano-expirado';

const AppRoutes: React.FC = () => {
  const { user, isLoadingAuth } = useAuth();
  const { user: adminUser, isLoading: isLoadingAdmin } = useAdminContext();

  console.log('AppRoutes: Estado atual', {
    hasUser: !!user,
    hasAdminUser: !!adminUser,
    isLoadingAuth,
    isLoadingAdmin,
    userEmail: user?.email,
    adminEmail: adminUser?.email,
    isAdmin: adminUser?.isAdmin
  });

  if (isLoadingAuth || isLoadingAdmin) {
    return <div>Carregando...</div>;
  }

  // Determinar se é admin baseado no AdminContext
  const isAdmin = adminUser && adminUser.isAdmin;

  return (
    <Routes>
      {/* Rotas públicas sempre disponíveis */}
      {publicRoutes}
      
      {/* Rota especial para plano expirado */}
      <Route path="/plano-expirado" element={<PlanoExpirado />} />
      
      {/* Rotas administrativas - renderizando o array de routes */}
      {AdminRoutes()}
      
      {/* Rotas protegidas */}
      {protectedRoutes}
      
      {/* Rota protegida para dashboard principal */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PlanExpiredGuard>
            <DashboardPage />
          </PlanExpiredGuard>
        </ProtectedRoute>
      } />
      
      {/* Rota raiz - redirecionamento baseado no tipo de usuário */}
      <Route path="/" element={
        // Se tem admin logado, redirecionar para admin
        isAdmin ? (
          <Navigate to="/admin" replace />
        ) : user ? (
          // Se tem usuário comum logado, redirecionar para dashboard
          <Navigate to="/dashboard" replace />
        ) : (
          // Se não tem ninguém logado, redirecionar para home
          <Navigate to="/home" replace />
        )
      } />
      
      {/* Redirecionar qualquer rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

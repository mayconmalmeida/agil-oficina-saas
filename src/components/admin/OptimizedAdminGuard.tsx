
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminContext } from '@/contexts/AdminContext';
import Loading from '@/components/ui/loading';

interface OptimizedAdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin';
}

const OptimizedAdminGuard: React.FC<OptimizedAdminGuardProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, error, checkAdminPermissions } = useAdminContext();

  console.log('OptimizedAdminGuard: Estado:', {
    hasUser: !!user,
    isLoading,
    error,
    requiredRole,
    userRole: user?.role,
    userEmail: user?.email
  });

  // Aguardar carregamento
  if (isLoading) {
    return <Loading fullscreen text="Verificando permissões administrativas..." />;
  }

  // Se tem usuário admin válido, permitir acesso
  if (user && user.isAdmin && checkAdminPermissions(requiredRole)) {
    console.log('OptimizedAdminGuard: ✅ Acesso permitido');
    return <>{children}</>;
  }

  // Caso contrário, redirecionar para login
  console.log('OptimizedAdminGuard: ❌ Redirecionando para login');
  return <Navigate to="/admin/login" replace />;
};

export default OptimizedAdminGuard;

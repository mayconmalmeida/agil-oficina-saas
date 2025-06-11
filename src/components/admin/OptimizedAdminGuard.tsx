
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

  console.log('OptimizedAdminGuard: Estado atual:', {
    hasUser: !!user,
    isLoading,
    error,
    requiredRole
  });

  // Aguardar carregamento
  if (isLoading) {
    return <Loading fullscreen text="Verificando permissões administrativas..." />;
  }

  // Se há erro ou não há usuário, redirecionar para login admin
  if (error || !user) {
    console.log('OptimizedAdminGuard: Redirecionando para login admin');
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar permissões específicas
  if (!checkAdminPermissions(requiredRole)) {
    console.log('OptimizedAdminGuard: Permissões insuficientes');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('OptimizedAdminGuard: Acesso permitido');
  return <>{children}</>;
};

export default OptimizedAdminGuard;

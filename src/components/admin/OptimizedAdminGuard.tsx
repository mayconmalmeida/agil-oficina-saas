
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
    requiredRole,
    userRole: user?.role
  });

  // Aguardar carregamento
  if (isLoading) {
    return <Loading fullscreen text="Verificando permissões administrativas..." />;
  }

  // Se há erro, redirecionar para login admin
  if (error) {
    console.log('OptimizedAdminGuard: Erro detectado, redirecionando para login admin:', error);
    return <Navigate to="/admin/login" replace />;
  }

  // Se não há usuário, redirecionar para login admin
  if (!user) {
    console.log('OptimizedAdminGuard: Usuário não encontrado, redirecionando para login admin');
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar permissões específicas
  if (!checkAdminPermissions(requiredRole)) {
    console.log('OptimizedAdminGuard: Permissões insuficientes para role:', requiredRole);
    return <Navigate to="/admin/login" replace />;
  }

  console.log('OptimizedAdminGuard: Acesso permitido para admin:', user.email, 'role:', user.role);
  return <>{children}</>;
};

export default OptimizedAdminGuard;


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
    userRole: user?.role,
    userEmail: user?.email
  });

  // Aguardar carregamento - mas não indefinidamente
  if (isLoading) {
    return <Loading fullscreen text="Verificando permissões administrativas..." />;
  }

  // Se há usuário admin válido, permitir acesso mesmo com erro
  if (user && user.isAdmin && checkAdminPermissions(requiredRole)) {
    console.log('OptimizedAdminGuard: Acesso permitido para admin:', user.email, 'role:', user.role);
    return <>{children}</>;
  }

  // Se não há usuário, redirecionar para login admin
  if (!user) {
    console.log('OptimizedAdminGuard: Usuário não encontrado, redirecionando para login admin');
    return <Navigate to="/admin/login" replace />;
  }

  // Se há usuário mas não é admin, redirecionar para login admin
  if (user && !user.isAdmin) {
    console.log('OptimizedAdminGuard: Usuário não é admin, redirecionando para login admin');
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar permissões específicas
  if (!checkAdminPermissions(requiredRole)) {
    console.log('OptimizedAdminGuard: Permissões insuficientes para role:', requiredRole);
    return <Navigate to="/admin/login" replace />;
  }

  // Se chegou até aqui mas ainda há erro, mostrar o erro mas não redirecionar
  if (error) {
    console.warn('OptimizedAdminGuard: Erro detectado mas usuário admin válido:', error);
  }

  return <>{children}</>;
};

export default OptimizedAdminGuard;

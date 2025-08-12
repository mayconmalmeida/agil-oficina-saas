import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminContext } from '@/contexts/AdminContext';
import Loading from '@/components/ui/loading';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin';
}

const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, error, checkAdminPermissions } = useAdminContext();

  console.log('AdminGuard: Estado atual:', {
    hasUser: !!user,
    isLoading,
    error,
    requiredRole,
    userRole: user?.role,
    userEmail: user?.email
  });

  // Aguardar carregamento completo antes de tomar decisões
  if (isLoading) {
    console.log('AdminGuard: Aguardando carregamento de autenticação admin');
    return <Loading fullscreen text="Verificando permissões de administrador..." />;
  }

  // Se houve erro ou não tem usuário admin válido, redirecionar para login
  if (error || !user || !user.isAdmin) {
    console.log('AdminGuard: Acesso negado - redirecionando para login admin', {
      error,
      hasUser: !!user,
      isAdmin: user?.isAdmin
    });
    return <Navigate to="/admin/login" replace />;
  }

  // Verificar permissões específicas se necessário
  if (!checkAdminPermissions(requiredRole)) {
    console.log('AdminGuard: Permissões insuficientes para role:', requiredRole);
    return <Navigate to="/admin/login" replace />;
  }

  console.log('AdminGuard: Acesso permitido para admin:', user.email);
  return <>{children}</>;
};

export default AdminGuard;
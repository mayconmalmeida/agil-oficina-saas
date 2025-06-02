
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/loading';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();

  if (isLoadingAuth) {
    return <Loading fullscreen text="Verificando permissões de administrador..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se é admin baseado no role da tabela profiles
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  
  if (!isAdmin) {
    console.log('Usuário não é admin, role:', user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('AdminGuard: Acesso permitido para admin com role:', user.role);
  return <>{children}</>;
};

export default AdminGuard;

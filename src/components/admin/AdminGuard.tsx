
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/loading';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isLoadingAuth, user } = useAuth();

  // CRÍTICO: Aguardar carregamento completo antes de tomar decisões
  if (isLoadingAuth) {
    console.log('AdminGuard: Aguardando carregamento de autenticação');
    return <Loading fullscreen text="Verificando permissões de administrador..." />;
  }

  if (!user) {
    console.log('AdminGuard: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Verificar se é admin baseado APENAS na role da tabela profiles
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  
  if (!isAdmin) {
    console.log('AdminGuard: Usuário não é admin, role:', user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('AdminGuard: Acesso permitido para admin com role:', user.role);
  return <>{children}</>;
};

export default AdminGuard;

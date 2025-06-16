
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';
import RouteManager from '@/components/layout/RouteManager';
import AppRoutes from '@/components/app/AppRoutes';

const AppContent: React.FC = () => {
  const { isLoadingAuth } = useAuth();

  // Aguardar a inicialização completa da autenticação
  if (isLoadingAuth) {
    return <Loading fullscreen text="Inicializando aplicação..." />;
  }

  return (
    <RouteManager>
      <AppRoutes />
    </RouteManager>
  );
};

export default AppContent;

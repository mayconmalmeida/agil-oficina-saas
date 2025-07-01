
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';
import RouteManager from '@/components/layout/RouteManager';
import AppRoutes from '@/components/app/AppRoutes';

const AppContent: React.FC = () => {
  const { isLoadingAuth } = useAuth();
  const [forceLoad, setForceLoad] = useState(false);

  // Timeout de segurança mais agressivo para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('AppContent: Timeout de loading atingido, forçando carregamento do app');
      setForceLoad(true);
    }, 1500); // Reduzido para 1.5 segundos

    return () => clearTimeout(timeout);
  }, []);

  // Mostrar app se não está carregando ou se passou do timeout
  if (!isLoadingAuth || forceLoad) {
    return (
      <RouteManager>
        <AppRoutes />
      </RouteManager>
    );
  }

  return <Loading fullscreen text="Carregando aplicação..." />;
};

export default AppContent;


import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';
import RouteManager from '@/components/layout/RouteManager';
import AppRoutes from '@/components/app/AppRoutes';

const AppContent: React.FC = () => {
  const { isLoadingAuth } = useAuth();
  const [forceLoad, setForceLoad] = useState(false);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceLoad(true);
    }, 3000); // 3 segundos máximo de loading

    return () => clearTimeout(timeout);
  }, []);

  // Se passou do timeout ou não está mais carregando, mostrar app
  if (!isLoadingAuth || forceLoad) {
    return (
      <RouteManager>
        <AppRoutes />
      </RouteManager>
    );
  }

  return <Loading fullscreen text="Inicializando aplicação..." />;
};

export default AppContent;

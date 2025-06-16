
import React, { useEffect } from 'react';
import { useRoutePersistence } from '@/hooks/useRoutePersistence';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

interface RouteManagerProps {
  children: React.ReactNode;
}

const RouteManager: React.FC<RouteManagerProps> = ({ children }) => {
  const { restoreLastRoute } = useRoutePersistence();
  
  // Usar o hook de persistência de sessão
  useSessionPersistence();

  // Tentar restaurar a última rota uma vez ao montar o componente
  useEffect(() => {
    // Pequeno delay para garantir que a autenticação foi verificada
    const timer = setTimeout(() => {
      restoreLastRoute();
    }, 100);

    return () => clearTimeout(timer);
  }, [restoreLastRoute]);

  return <>{children}</>;
};

export default RouteManager;

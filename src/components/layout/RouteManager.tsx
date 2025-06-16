
import React, { useEffect } from 'react';
import { useRoutePersistence } from '@/hooks/useRoutePersistence';

interface RouteManagerProps {
  children: React.ReactNode;
}

const RouteManager: React.FC<RouteManagerProps> = ({ children }) => {
  const { restoreLastRoute } = useRoutePersistence();

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

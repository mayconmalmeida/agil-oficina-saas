
import React from 'react';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { Badge } from '@/components/ui/badge';

const DaysRemainingCounter: React.FC = () => {
  const { diasRestantes, tipoPlano, isExpiringSoon, isExpired, loading } = useDaysRemaining();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <Badge variant="destructive" className="text-xs">
        Trial expirado
      </Badge>
    );
  }

  if (tipoPlano === 'trial' && diasRestantes > 0) {
    const badgeVariant = isExpiringSoon ? "destructive" : "secondary";
    
    return (
      <Badge variant={badgeVariant} className="text-xs">
        {diasRestantes === 1 
          ? `${diasRestantes} dia restante` 
          : `${diasRestantes} dias restantes`
        }
      </Badge>
    );
  }

  if (tipoPlano === 'sem_plano') {
    return (
      <Badge variant="outline" className="text-xs">
        Sem plano ativo
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="text-xs bg-green-600">
      Plano ativo
    </Badge>
  );
};

export default DaysRemainingCounter;


import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';

const DaysRemainingCounter: React.FC = () => {
  const { diasRestantes, tipoPlano, isExpiringSoon, isExpired, loading } = useDaysRemaining();

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Carregando...
      </Badge>
    );
  }

  if (tipoPlano === 'sem_plano') {
    return null;
  }

  const getBadgeVariant = () => {
    if (isExpired) return 'destructive';
    if (isExpiringSoon) return 'destructive';
    if (tipoPlano === 'trial') return 'secondary';
    return 'default';
  };

  const getBadgeClass = () => {
    if (isExpired) return 'bg-red-100 text-red-800 border-red-200';
    if (isExpiringSoon) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (tipoPlano === 'trial') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getDisplayText = () => {
    if (isExpired) {
      return tipoPlano === 'trial' ? '⚠️ Teste expirado' : '⚠️ Assinatura expirada';
    }

    const emoji = tipoPlano === 'trial' ? '🔔' : '📅';
    const tipo = tipoPlano === 'trial' ? 'Teste' : 'Assinatura';
    const dias = diasRestantes === 1 ? '1 dia' : `${diasRestantes} dias`;
    
    return `${emoji} ${tipo}: ${dias} restantes`;
  };

  return (
    <Badge 
      variant={getBadgeVariant()} 
      className={`${getBadgeClass()} text-xs font-medium`}
    >
      {getDisplayText()}
    </Badge>
  );
};

export default DaysRemainingCounter;

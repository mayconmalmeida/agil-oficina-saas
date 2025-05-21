
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BudgetStatusProps {
  status: string;
}

const BudgetStatus: React.FC<BudgetStatusProps> = ({ status }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'convertido':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Convertido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return getStatusBadge(status);
};

export default BudgetStatus;

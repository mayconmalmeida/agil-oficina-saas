
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface TableStatusBadgeProps {
  status: string;
  trialEndsAt: string | null;
}

const TableStatusBadge = ({ status, trialEndsAt }: TableStatusBadgeProps) => {
  if (status === 'active') {
    return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
  }
  
  if (trialEndsAt) {
    const trialDate = new Date(trialEndsAt);
    if (trialDate > new Date()) {
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Em teste</Badge>;
    }
    return <Badge variant="destructive">Expirado</Badge>;
  }
  
  return <Badge variant="destructive">Sem assinatura</Badge>;
};

export default TableStatusBadge;

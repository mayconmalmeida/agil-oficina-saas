
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ClientListHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Contato</TableHead>
        <TableHead className="hidden lg:table-cell">Veículo</TableHead>
        <TableHead className="hidden md:table-cell">Placa</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

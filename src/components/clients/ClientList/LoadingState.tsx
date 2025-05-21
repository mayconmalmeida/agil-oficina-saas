
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

export const LoadingState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
        Carregando clientes...
      </TableCell>
    </TableRow>
  );
};

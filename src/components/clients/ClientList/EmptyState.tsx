
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

export const EmptyState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
        Nenhum cliente encontrado.
      </TableCell>
    </TableRow>
  );
};

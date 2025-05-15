
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyTableProps {
  colSpan: number;
  message?: string;
}

const EmptyTable = ({ colSpan, message = "Nenhuma oficina encontrada" }: EmptyTableProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8">
        {message}
      </TableCell>
    </TableRow>
  );
};

export default EmptyTable;

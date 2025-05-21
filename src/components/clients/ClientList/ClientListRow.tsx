
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Eye, Edit, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Client } from '@/utils/supabaseTypes';

interface ClientListRowProps {
  client: Client;
  onRowClick: (clientId: string) => void;
  onView: (e: React.MouseEvent, clientId: string) => void;
  onEdit: (e: React.MouseEvent, clientId: string) => void;
  onToggleStatus: (e: React.MouseEvent, clientId: string) => void;
}

export const ClientListRow: React.FC<ClientListRowProps> = ({
  client,
  onRowClick,
  onView,
  onEdit,
  onToggleStatus
}) => {
  return (
    <TableRow 
      key={client.id}
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onRowClick(client.id)}
    >
      <TableCell className="font-medium">{client.nome}</TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-xs">
            <Phone className="h-3 w-3 mr-1 text-gray-500" />
            <span>{client.telefone || '-'}</span>
          </div>
          {client.email && (
            <div className="flex items-center text-xs">
              <Mail className="h-3 w-3 mr-1 text-gray-500" />
              <span>{client.email}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {client.marca ? `${client.marca} ${client.modelo || ''}` : client.veiculo || '-'}
      </TableCell>
      <TableCell className="hidden md:table-cell">{client.placa || '-'}</TableCell>
      <TableCell>
        {client.is_active === false ? (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
        ) : (
          <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => onView(e, client.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => onEdit(e, client.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => onToggleStatus(e, client.id)}>
            {client.is_active === false ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

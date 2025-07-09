
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { SubscriptionWithProfile } from '@/utils/supabaseTypes';

type SubscriptionsTableProps = {
  subscriptions: SubscriptionWithProfile[];
  isLoading?: boolean;
  onEdit?: (subscription: any) => void;
};

const SubscriptionsTable = ({ subscriptions, isLoading = false, onEdit }: SubscriptionsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'cancelled':
        return <Badge className="bg-amber-500">Cancelada</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expirada</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconhecido</Badge>;
    }
  };

  return (
    <Table>
      <TableCaption>Lista de todas as assinaturas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Oficina</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Data de Início</TableHead>
          <TableHead>Expira em</TableHead>
          <TableHead>Método de Pagamento</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              Carregando assinaturas...
            </TableCell>
          </TableRow>
        ) : (
          <>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.nome_oficina}</TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>R$ {sub.amount ? (sub.amount / 100).toFixed(2) : '0.00'}</TableCell>
                <TableCell>{sub.created_at ? format(new Date(sub.created_at), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell>
                  {sub.expires_at ? format(new Date(sub.expires_at), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{sub.payment_method || 'N/A'}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(sub.status || 'unknown')}
                </TableCell>
                <TableCell className="text-center">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(sub)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Nenhuma assinatura encontrada
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default SubscriptionsTable;

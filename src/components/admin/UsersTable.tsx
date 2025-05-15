
import React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import TableStatusBadge from './users/TableStatusBadge';
import TableRowActions from './users/TableRowActions';
import EmptyTable from './users/EmptyTable';

export type Workshop = {
  id: string;
  nome_oficina: string;
  email: string;
  telefone?: string | null;
  cnpj: string | null;
  responsavel: string | null;
  plano: string | null;
  is_active: boolean;
  created_at: string;
  trial_ends_at: string | null;
  subscription_status: string;
  quote_count: number;
};

export type UsersTableProps = {
  users: Workshop[];
  isLoading?: boolean;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onViewQuotes: (userId: string) => void;
  onViewDetails: (userId: string) => void;
  onEditUser: (user: Workshop) => void;
  onChangePlan: (user: Workshop) => void;
  onRenewSubscription: (user: Workshop) => void;
  onGeneratePDF: (user: Workshop) => void;
};

const UsersTable = ({ 
  users, 
  isLoading = false, 
  onToggleStatus, 
  onViewQuotes,
  onViewDetails,
  onEditUser,
  onChangePlan,
  onRenewSubscription,
  onGeneratePDF 
}: UsersTableProps) => {
  
  const getSubscriptionStatusText = (status: string, trialEndsAt: string | null) => {
    if (status === 'active') return 'Assinatura Ativa';
    
    if (trialEndsAt) {
      const trialDate = new Date(trialEndsAt);
      if (trialDate > new Date()) {
        return `Em teste até ${format(trialDate, 'dd/MM/yyyy')}`;
      }
      return 'Teste expirado';
    }
    
    return 'Sem assinatura';
  };

  return (
    <Table>
      <TableCaption>Lista de todas as oficinas cadastradas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Oficina</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Plano</TableHead>
          <TableHead>Data de Cadastro</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <EmptyTable colSpan={10} message="Carregando oficinas..." />
        ) : (
          <>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome_oficina || 'Não definido'}</TableCell>
                <TableCell>{user.cnpj || '-'}</TableCell>
                <TableCell>{user.responsavel || '-'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.telefone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.plano === 'premium' ? 'default' : 'secondary'}>
                    {user.plano === 'premium' ? 'Premium' : 'Essencial'}
                  </Badge>
                </TableCell>
                <TableCell>{user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell>
                  {user.trial_ends_at ? format(new Date(user.trial_ends_at), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <TableStatusBadge 
                    status={user.subscription_status} 
                    trialEndsAt={user.trial_ends_at} 
                  />
                </TableCell>
                <TableCell>
                  <TableRowActions 
                    user={user}
                    onToggleStatus={onToggleStatus}
                    onViewDetails={onViewDetails}
                    onEditUser={onEditUser}
                    onChangePlan={onChangePlan}
                    onRenewSubscription={onRenewSubscription}
                    onGeneratePDF={onGeneratePDF}
                  />
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <EmptyTable colSpan={10} />}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

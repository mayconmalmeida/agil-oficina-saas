
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';
import { 
  FileText, 
  PenIcon, 
  Eye, 
  UserCheck, 
  CalendarPlus, 
  FileOutput 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

  const getSubscriptionStatusBadge = (status: string, trialEndsAt: string | null) => {
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
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8">
              Carregando oficinas...
            </TableCell>
          </TableRow>
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
                  {getSubscriptionStatusBadge(user.subscription_status, user.trial_ends_at)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewDetails(user.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditUser(user)}
                    >
                      <PenIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onChangePlan(user)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRenewSubscription(user)}
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onToggleStatus(user.id, user.is_active)}
                    >
                      <Switch
                        checked={user.is_active}
                        className="scale-75"
                      />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onGeneratePDF(user)}
                    >
                      <FileOutput className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Nenhuma oficina encontrada
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

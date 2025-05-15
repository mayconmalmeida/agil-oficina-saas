
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ProfileWithStats } from '@/utils/supabaseTypes';

export type UsersTableProps = {
  users: ProfileWithStats[];
  isLoading?: boolean;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onViewQuotes: (userId: string) => void;
};

const UsersTable = ({ users, isLoading = false, onToggleStatus, onViewQuotes }: UsersTableProps) => {
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
      <TableCaption>Lista de todos os usuários registrados</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Oficina</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Data de Cadastro</TableHead>
          <TableHead>Status do Plano</TableHead>
          <TableHead className="text-center">Nº de Orçamentos</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Carregando usuários...
            </TableCell>
          </TableRow>
        ) : (
          <>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome_oficina || 'Não definido'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                <TableCell>
                  {getSubscriptionStatusText(user.subscription_status, user.trial_ends_at)}
                </TableCell>
                <TableCell className="text-center">{user.quote_count}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={() => onToggleStatus(user.id, user.is_active)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewQuotes(user.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Orçamentos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nenhum usuário encontrado
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

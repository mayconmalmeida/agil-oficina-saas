
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ActionMenu } from "@/components/ui/action-menu";
import { 
  FileText, 
  PenIcon, 
  Eye, 
  UserCheck, 
  CalendarPlus, 
  FileOutput,
  MoreVertical
} from "lucide-react";
import { Workshop } from '@/components/admin/UsersTable';

interface TableRowActionsProps {
  user: Workshop;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onViewDetails: (userId: string) => void;
  onEditUser: (user: Workshop) => void;
  onChangePlan: (user: Workshop) => void;
  onRenewSubscription: (user: Workshop) => void;
  onGeneratePDF: (user: Workshop) => void;
}

const TableRowActions = ({ 
  user, 
  onToggleStatus, 
  onViewDetails, 
  onEditUser, 
  onChangePlan, 
  onRenewSubscription, 
  onGeneratePDF 
}: TableRowActionsProps) => {
  const actionItems = [
    {
      label: "Ver Detalhes",
      icon: Eye,
      onClick: () => onViewDetails(user.id)
    },
    {
      label: "Editar Usuário",
      icon: PenIcon,
      onClick: () => onEditUser(user)
    },
    {
      label: "Alterar Plano",
      icon: UserCheck,
      onClick: () => onChangePlan(user)
    },
    {
      label: "Renovar Assinatura",
      icon: CalendarPlus,
      onClick: () => onRenewSubscription(user)
    },
    {
      label: "Gerar PDF",
      icon: FileOutput,
      onClick: () => onGeneratePDF(user)
    }
  ];

  return (
    <div className="flex justify-end items-center space-x-1">
      {/* Botões rápidos principais */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onViewDetails(user.id)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onToggleStatus(user.id, user.is_active)}
        className="h-8 w-8 p-0"
      >
        <Switch
          checked={user.is_active}
          className="scale-75"
          disabled
        />
      </Button>

      {/* Menu de ações dropdown */}
      <ActionMenu items={actionItems} />
    </div>
  );
};

export default TableRowActions;

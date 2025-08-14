
import React from 'react';
import { 
  Pencil, 
  UserCheck, 
  Ban, 
  CalendarPlus, 
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/ui/action-menu";
import { WorkshopDetails } from '@/components/admin/users/UserDetailsDialog';

interface WorkshopActionButtonsProps {
  workshop: WorkshopDetails;
  onEdit: (workshop: WorkshopDetails) => void;
  onChangePlan: (workshop: WorkshopDetails) => void;
  onRenewSubscription: (workshop: WorkshopDetails) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onGeneratePDF: (workshop: WorkshopDetails) => void;
}

const WorkshopActionButtons = ({
  workshop,
  onEdit,
  onChangePlan,
  onRenewSubscription,
  onToggleStatus,
  onGeneratePDF
}: WorkshopActionButtonsProps) => {
  const quickActionItems = [
    {
      label: "Alterar Plano",
      icon: UserCheck,
      onClick: () => onChangePlan(workshop)
    },
    {
      label: "Renovar Vencimento",
      icon: CalendarPlus,
      onClick: () => onRenewSubscription(workshop)
    },
    {
      label: "Gerar Fatura PDF",
      icon: FileText,
      onClick: () => onGeneratePDF(workshop)
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 pt-4">
      {/* Botões principais sempre visíveis */}
      <Button 
        variant="outline" 
        onClick={() => onEdit(workshop)}
        className="flex items-center gap-2"
      >
        <Pencil className="h-4 w-4" />
        Editar Dados
      </Button>
      
      <Button 
        variant={workshop.is_active ? "destructive" : "outline"}
        onClick={() => onToggleStatus(workshop.id, workshop.is_active)}
        className="flex items-center gap-2"
      >
        <Ban className="h-4 w-4" />
        {workshop.is_active ? 'Desativar Oficina' : 'Ativar Oficina'}
      </Button>

      {/* Menu dropdown para ações secundárias */}
      <div className="flex items-center">
        <ActionMenu items={quickActionItems} triggerClassName="h-10" />
      </div>
    </div>
  );
};

export default WorkshopActionButtons;

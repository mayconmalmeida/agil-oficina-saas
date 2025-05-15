
import React from 'react';
import { 
  Pencil, 
  UserCheck, 
  Ban, 
  CalendarPlus, 
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex flex-wrap gap-2 pt-4">
      <Button 
        variant="outline" 
        onClick={() => onEdit(workshop)}
        className="flex items-center gap-2"
      >
        <Pencil className="h-4 w-4" />
        Editar Dados
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => onChangePlan(workshop)}
        className="flex items-center gap-2"
      >
        <UserCheck className="h-4 w-4" />
        Alterar Plano
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => onRenewSubscription(workshop)}
        className="flex items-center gap-2"
      >
        <CalendarPlus className="h-4 w-4" />
        Renovar Vencimento
      </Button>
      
      <Button 
        variant={workshop.is_active ? "destructive" : "outline"}
        onClick={() => onToggleStatus(workshop.id, workshop.is_active)}
        className="flex items-center gap-2"
      >
        <Ban className="h-4 w-4" />
        {workshop.is_active ? 'Desativar Oficina' : 'Ativar Oficina'}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => onGeneratePDF(workshop)}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Gerar Fatura PDF
      </Button>
    </div>
  );
};

export default WorkshopActionButtons;

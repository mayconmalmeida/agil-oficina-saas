
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  PenIcon, 
  Eye, 
  UserCheck, 
  CalendarPlus, 
  FileOutput 
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
  return (
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
  );
};

export default TableRowActions;

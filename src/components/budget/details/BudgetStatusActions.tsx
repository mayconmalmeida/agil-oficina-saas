
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface BudgetStatusActionsProps {
  status: string;
  onStatusUpdate: (status: string) => void;
}

const BudgetStatusActions: React.FC<BudgetStatusActionsProps> = ({
  status,
  onStatusUpdate
}) => {
  if (status !== 'pendente') {
    return null;
  }

  return (
    <div className="flex justify-end gap-2 mt-6">
      <Button 
        onClick={() => onStatusUpdate('aprovado')} 
        className="bg-green-600 hover:bg-green-700"
      >
        <Check className="mr-2 h-4 w-4" /> Aprovar
      </Button>
      <Button 
        onClick={() => onStatusUpdate('cancelado')} 
        variant="destructive"
      >
        <X className="mr-2 h-4 w-4" /> Cancelar
      </Button>
    </div>
  );
};

export default BudgetStatusActions;

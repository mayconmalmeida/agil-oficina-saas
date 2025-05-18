
import React from 'react';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BudgetHeaderProps {
  createdAt: string;
  onBack: () => void;
  onPrint: () => void;
  onEdit: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({ 
  createdAt, onBack, onPrint, onEdit 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Detalhes do Orçamento</h1>
        <p className="text-muted-foreground">
          Criado em {formatDate(createdAt)}
        </p>
      </div>
      <div className="flex items-center mt-4 md:mt-0 gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button variant="outline" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>
    </div>
  );
};

export default BudgetHeader;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface BudgetActionsProps {
  budgetId: string;
  status: string;
}

const BudgetActions: React.FC<BudgetActionsProps> = ({ budgetId, status }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Handle view budget details
  const handleViewBudget = () => {
    navigate(`/orcamentos/${budgetId}`);
  };
  
  // Handle print budget
  const handlePrintBudget = () => {
    toast({
      title: "Impressão solicitada",
      description: `Preparando orçamento ${budgetId} para impressão`,
    });
    // Here you would implement the actual print functionality
  };
  
  // Handle email budget
  const handleEmailBudget = () => {
    toast({
      title: "Email",
      description: `Preparando para enviar orçamento ${budgetId} por email`,
    });
    // Here you would implement the actual email sending functionality
  };
  
  // Handle convert budget to service order
  const handleConvertBudget = () => {
    toast({
      title: "Conversão",
      description: `Convertendo orçamento ${budgetId} para ordem de serviço`,
    });
    // Here you would implement the actual conversion functionality
    navigate(`/ordens/novo?orcamento=${budgetId}`);
  };

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" title="Ver detalhes" onClick={handleViewBudget}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Imprimir" onClick={handlePrintBudget}>
        <Printer className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" title="Enviar por email" onClick={handleEmailBudget}>
        <Mail className="h-4 w-4" />
      </Button>
      {status === 'aprovado' && (
        <Button variant="ghost" size="icon" title="Converter para ordem de serviço" onClick={handleConvertBudget}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default BudgetActions;

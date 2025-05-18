
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight } from 'lucide-react';

interface ClientBudget {
  id: string;
  created_at: string;
  valor_total: number;
  status: string;
  descricao: string;
}

interface ClientBudgetsListProps {
  budgets: ClientBudget[];
  onViewBudget: (budgetId: string) => void;
}

const ClientBudgetsList: React.FC<ClientBudgetsListProps> = ({ budgets, onViewBudget }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluído': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tabs defaultValue="budgets">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
        <TabsTrigger value="notes">Observações</TabsTrigger>
      </TabsList>
      <TabsContent value="budgets" className="mt-4">
        {budgets.length > 0 ? (
          <div className="space-y-3">
            {budgets.slice(0, 3).map((budget) => (
              <div key={budget.id} className="border rounded-md p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{formatDate(budget.created_at)}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{budget.descricao}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
                    <p className="text-sm font-medium mt-1">{formatCurrency(budget.valor_total)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 h-7 text-xs"
                  onClick={() => onViewBudget(budget.id)}
                >
                  Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
            
            {budgets.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Ver todos ({budgets.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Nenhum orçamento encontrado</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="notes" className="mt-4">
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Sem observações</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ClientBudgetsList;

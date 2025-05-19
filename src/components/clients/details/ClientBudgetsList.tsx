
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface ClientBudgetsListProps {
  clientId: string;
  onViewBudget: (budgetId: string) => void;
}

const ClientBudgetsList: React.FC<ClientBudgetsListProps> = ({ 
  clientId,
  onViewBudget
}) => {
  // Placeholder for budget list, would need to fetch from API
  const budgets = [
    { id: '1', date: '2023-01-01', value: 'R$ 1.500,00', status: 'Aprovado' },
    { id: '2', date: '2023-02-15', value: 'R$ 750,00', status: 'Pendente' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Orçamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div 
                key={budget.id} 
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{budget.date}</p>
                  <p className="text-sm text-gray-500">{budget.value} - {budget.status}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewBudget(budget.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            Nenhum orçamento encontrado para este cliente.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientBudgetsList;

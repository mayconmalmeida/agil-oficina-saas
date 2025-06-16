
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Budget {
  id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
}

export interface ClientBudgetsListProps {
  clientId: string;
  onViewBudget: (budgetId: string) => void;
  onCreateBudget?: (clientId: string) => void;
}

const ClientBudgetsList: React.FC<ClientBudgetsListProps> = ({ 
  clientId,
  onViewBudget,
  onCreateBudget
}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        console.log('Buscando orçamentos para cliente:', clientId);
        
        // Primeiro, buscar o nome do cliente
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('nome')
          .eq('id', clientId)
          .single();
          
        if (clientError) {
          console.error('Erro ao buscar cliente:', clientError);
          throw clientError;
        }

        // Buscar orçamentos que mencionam o nome do cliente
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('orcamentos')
          .select('*')
          .ilike('cliente', `%${clientData.nome}%`)
          .order('created_at', { ascending: false });
          
        if (budgetsError) {
          console.error('Erro ao buscar orçamentos:', budgetsError);
          throw budgetsError;
        }
        
        console.log('Orçamentos encontrados:', budgetsData);
        setBudgets(budgetsData || []);
        
      } catch (error: any) {
        console.error('Erro ao carregar orçamentos:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar orçamentos",
          description: "Não foi possível carregar os orçamentos do cliente."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchBudgets();
    }
  }, [clientId, toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Orçamentos</CardTitle>
        {onCreateBudget && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCreateBudget(clientId)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div 
                key={budget.id} 
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{formatDate(budget.created_at)}</p>
                    <Badge className={`text-xs ${getStatusColor(budget.status)}`}>
                      {budget.status || 'Pendente'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {formatCurrency(budget.valor_total)}
                  </p>
                  {budget.veiculo && (
                    <p className="text-xs text-gray-500">{budget.veiculo}</p>
                  )}
                  {budget.descricao && (
                    <p className="text-xs text-gray-500 truncate max-w-48" title={budget.descricao}>
                      {budget.descricao}
                    </p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewBudget(budget.id)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Nenhum orçamento encontrado para este cliente.
            </p>
            {onCreateBudget && (
              <Button 
                variant="outline" 
                onClick={() => onCreateBudget(clientId)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar Primeiro Orçamento
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientBudgetsList;

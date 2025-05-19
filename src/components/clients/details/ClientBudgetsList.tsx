
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Budget } from '@/utils/supabaseTypes';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatUtils';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface ClientBudgetsListProps {
  clientId: string;
}

const ClientBudgetsList: React.FC<ClientBudgetsListProps> = ({ clientId }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('cliente_id', clientId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setBudgets(data || []);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBudgets();
  }, [clientId]);
  
  const handleCreateBudget = () => {
    navigate(`/budgets/new?clientId=${clientId}`);
  };
  
  if (isLoading) return <p className="text-sm text-gray-500">Carregando orçamentos...</p>;
  
  if (budgets.length === 0) {
    return (
      <>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Orçamentos</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCreateBudget}
            className="h-7 text-xs"
          >
            Novo Orçamento
          </Button>
        </div>
        <p className="text-sm text-gray-500">Nenhum orçamento encontrado para este cliente.</p>
        <Separator className="my-3" />
      </>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Orçamentos</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCreateBudget}
          className="h-7 text-xs"
        >
          Novo Orçamento
        </Button>
      </div>
      
      <div className="space-y-2">
        {budgets.map((budget) => (
          <div 
            key={budget.id}
            className="text-sm p-2 bg-gray-50 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{budget.descricao.substring(0, 30)}{budget.descricao.length > 30 ? '...' : ''}</p>
              <p className="text-gray-500 text-xs">{new Date(budget.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(budget.valor_total)}</p>
              <p className="text-xs uppercase">{budget.status}</p>
            </div>
          </div>
        ))}
      </div>
      <Separator className="my-3" />
    </>
  );
};

export default ClientBudgetsList;

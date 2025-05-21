
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import BudgetStatus from './BudgetStatus';
import BudgetActions from './BudgetActions';
import { formatCurrency, formatDate, Budget, BudgetResponse, mockBudgets } from './utils';

interface BudgetListProps {
  searchQuery?: string;
  filter?: string;
}

const BudgetList: React.FC<BudgetListProps> = ({ 
  searchQuery = '',
  filter = 'todos'
}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*');
        
        if (error) {
          console.error('Error fetching budgets:', error);
          return;
        }
        
        if (data) {
          // Transform the data to match the Budget interface
          const formattedBudgets: Budget[] = (data as BudgetResponse[]).map(item => ({
            id: item.id,
            numero: `ORC-${new Date(item.created_at).getFullYear()}-${item.id.substring(0, 3)}`,
            cliente: item.cliente,
            veiculo: item.veiculo,
            data: item.created_at,
            valor: typeof item.valor_total === 'string' ? parseFloat(item.valor_total) : item.valor_total,
            status: item.status || 'pendente',
            itens: 0 // Default value since itens_count is not in the response
          }));
          
          setBudgets(formattedBudgets);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgets();
  }, []);
  
  // If no real data yet, use mock data
  const displayBudgets = budgets.length > 0 ? budgets : mockBudgets;
  
  // Filter budgets based on search query and filter
  const filteredBudgets = displayBudgets.filter(budget => {
    // First apply search query filter
    const matchesSearch = !searchQuery || 
      budget.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (budget.numero?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      budget.veiculo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply status filter
    if (filter === 'todos') return true;
    return budget.status === filter.slice(0, -1); // Remove 's' from plural filter name
  });
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Veículo</TableHead>
            <TableHead className="hidden md:table-cell">Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBudgets.map((budget) => (
            <TableRow key={budget.id}>
              <TableCell className="font-medium">{budget.numero || `-`}</TableCell>
              <TableCell>{budget.cliente}</TableCell>
              <TableCell className="hidden md:table-cell">{budget.veiculo}</TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(budget.data)}</TableCell>
              <TableCell className="text-right">{formatCurrency(budget.valor)}</TableCell>
              <TableCell>
                <BudgetStatus status={budget.status} />
              </TableCell>
              <TableCell>
                <BudgetActions budgetId={budget.id} status={budget.status} />
              </TableCell>
            </TableRow>
          ))}
          
          {filteredBudgets.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum orçamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BudgetList;

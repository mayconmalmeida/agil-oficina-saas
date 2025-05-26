
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Printer, Mail, ArrowRight, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatUtils';

interface BudgetListProps {
  searchQuery?: string;
  filter?: string;
}

interface Budget {
  id: string;
  numero?: string;
  cliente: string;
  veiculo: string;
  data: string;
  valor: number;
  status: string;
  itens?: number;
}

const BudgetList: React.FC<BudgetListProps> = ({ 
  searchQuery = '',
  filter = 'todos'
}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchBudgets();
  }, []);
  
  const fetchBudgets = async () => {
    try {
      console.log('Buscando orçamentos...');
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching budgets:', error);
        return;
      }
      
      console.log('Orçamentos encontrados:', data?.length || 0);
      console.log('Dados dos orçamentos:', data);
      
      if (data && data.length > 0) {
        // Transform the data to match the Budget interface
        const formattedBudgets: Budget[] = data.map(item => ({
          id: item.id,
          numero: `ORC-${new Date(item.created_at).getFullYear()}-${item.id.substring(0, 3).toUpperCase()}`,
          cliente: item.cliente,
          veiculo: item.veiculo,
          data: item.created_at,
          valor: typeof item.valor_total === 'string' ? parseFloat(item.valor_total) : item.valor_total,
          status: item.status || 'pendente',
          itens: 0 // Default value since we don't have this info
        }));
        
        setBudgets(formattedBudgets);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // If no real data yet, use mock data for demonstration
  const mockBudgets: Budget[] = [
    {
      id: "mock-1",
      numero: "ORC-2024-001",
      cliente: "João Silva",
      veiculo: "Toyota Corolla 2020",
      data: "2024-01-15",
      valor: 850.0,
      status: "pendente",
      itens: 3
    },
    {
      id: "mock-2",
      numero: "ORC-2024-002",
      cliente: "Maria Oliveira", 
      veiculo: "Honda Civic 2019",
      data: "2024-01-20",
      valor: 1250.0,
      status: "aprovado",
      itens: 5
    }
  ];
  
  // Use real data if available, otherwise show mock data
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'convertido':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Convertido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewBudget = (budgetId: string) => {
    console.log('Visualizando orçamento:', budgetId);
    navigate(`/orcamentos/${budgetId}`);
  };

  const handleEditBudget = (budgetId: string) => {
    console.log('Editando orçamento:', budgetId);
    navigate(`/orcamentos/editar/${budgetId}`);
  };

  const handlePrintBudget = (budgetId: string) => {
    console.log('Imprimindo orçamento:', budgetId);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A impressão de orçamentos estará disponível em breve.",
    });
  };

  const handleEmailBudget = (budgetId: string) => {
    console.log('Enviando orçamento por email:', budgetId);
    toast({
      title: "Funcionalidade em desenvolvimento", 
      description: "O envio por email estará disponível em breve.",
    });
  };

  const handleConvertToServiceOrder = (budgetId: string) => {
    console.log('Convertendo orçamento para OS:', budgetId);
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A conversão para ordem de serviço estará disponível em breve.",
    });
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando orçamentos...</p>
      </div>
    );
  }
  
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
              <TableCell>{getStatusBadge(budget.status)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Ver detalhes"
                    onClick={() => handleViewBudget(budget.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Editar"
                    onClick={() => handleEditBudget(budget.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Imprimir"
                    onClick={() => handlePrintBudget(budget.id)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Enviar por email"
                    onClick={() => handleEmailBudget(budget.id)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  {budget.status === 'aprovado' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Converter para ordem de serviço"
                      onClick={() => handleConvertToServiceOrder(budget.id)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {filteredBudgets.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {searchQuery || filter !== 'todos' 
                  ? 'Nenhum orçamento encontrado com os filtros aplicados.' 
                  : 'Nenhum orçamento cadastrado ainda. Clique em "Novo Orçamento" para começar.'
                }
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BudgetList;

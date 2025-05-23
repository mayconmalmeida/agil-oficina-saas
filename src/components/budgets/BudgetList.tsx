
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Printer, Mail, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

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
          const formattedBudgets: Budget[] = data.map(item => ({
            id: item.id,
            numero: `ORC-${new Date(item.created_at).getFullYear()}-${item.id.substring(0, 3)}`,
            cliente: item.cliente,
            veiculo: item.veiculo,
            data: item.created_at,
            valor: parseFloat(item.valor_total),
            status: item.status,
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
    
    fetchBudgets();
  }, []);
  
  // If no real data yet, use mock data
  const mockBudgets: Budget[] = [
    {
      id: "1",
      numero: "ORC-2023-001",
      cliente: "João Silva",
      veiculo: "Toyota Corolla 2020",
      data: "2023-05-12",
      valor: 850.0,
      status: "pendente",
      itens: 3
    },
    {
      id: "2",
      numero: "ORC-2023-002",
      cliente: "Maria Oliveira",
      veiculo: "Honda Civic 2019",
      data: "2023-05-15",
      valor: 1250.0,
      status: "aprovado",
      itens: 5
    },
    {
      id: "3",
      numero: "ORC-2023-003",
      cliente: "Carlos Pereira",
      veiculo: "Volkswagen Golf 2021",
      data: "2023-05-20",
      valor: 540.0,
      status: "rejeitado",
      itens: 2
    },
    {
      id: "4",
      numero: "ORC-2023-004",
      cliente: "Ana Santos",
      veiculo: "Fiat Uno 2018",
      data: "2023-05-22",
      valor: 380.0,
      status: "pendente",
      itens: 2
    },
    {
      id: "5",
      numero: "ORC-2023-005",
      cliente: "Paulo Souza",
      veiculo: "Chevrolet Onix 2022",
      data: "2023-05-25",
      valor: 1450.0,
      status: "convertido",
      itens: 7
    },
  ];
  
  // If we have real data use it, otherwise use mock data
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
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
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
                  <Button variant="ghost" size="icon" title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Imprimir">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Enviar por email">
                    <Mail className="h-4 w-4" />
                  </Button>
                  {budget.status === 'aprovado' && (
                    <Button variant="ghost" size="icon" title="Converter para ordem de serviço">
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

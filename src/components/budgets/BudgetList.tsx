
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/supabaseTypes';
import Loading from '@/components/ui/loading';

interface Budget {
  id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
}

interface BudgetListProps {
  searchQuery: string;
  filter: string;
}

const BudgetList: React.FC<BudgetListProps> = ({ searchQuery, filter }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'todos') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar orçamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar orçamentos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [filter]);

  const handleConvertToOS = async (budgetId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('create_ordem_servico_from_orcamento', {
        p_user_id: user.id,
        p_orcamento_id: budgetId,
        p_observacoes: 'Convertido automaticamente do orçamento'
      });

      if (error) throw error;

      toast({
        title: "Ordem de serviço criada",
        description: "O orçamento foi convertido em ordem de serviço com sucesso.",
      });

      // Atualizar a lista
      fetchBudgets();
      
      // Navegar para a página de ordem de serviço
      navigate('/dashboard/ordem-servico');
    } catch (error: any) {
      console.error('Erro ao converter orçamento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao converter orçamento",
        description: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'convertido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    budget.veiculo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    budget.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Loading text="Carregando orçamentos..." />;
  }

  if (filteredBudgets.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum orçamento encontrado
        </h3>
        <p className="text-gray-500">
          {searchQuery ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro orçamento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredBudgets.map((budget) => (
        <Card key={budget.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{budget.cliente}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{budget.veiculo}</p>
              </div>
              <Badge className={getStatusColor(budget.status)}>
                {budget.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Data:</p>
                <p className="font-medium">
                  {new Date(budget.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor:</p>
                <p className="font-medium text-green-600">
                  {formatCurrency(budget.valor_total)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Descrição:</p>
                <p className="text-sm">{budget.descricao}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/dashboard/orcamentos/${budget.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" /> Visualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/dashboard/orcamentos/editar/${budget.id}`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
              {budget.status === 'pendente' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleConvertToOS(budget.id)}
                >
                  <FileText className="h-4 w-4 mr-1" /> Converter em OS
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BudgetList;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, Edit, Check, X } from 'lucide-react';
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

const BudgetDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBudgetDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar orçamento:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar orçamento",
            description: "Não foi possível carregar os detalhes do orçamento.",
          });
          return;
        }
        
        setBudget(data);
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar o orçamento.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBudgetDetails();
  }, [id, toast]);
  
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
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleEdit = () => {
    navigate(`/orcamentos/editar/${id}`);
  };
  
  const handleStatusUpdate = async (status: string) => {
    if (!budget) return;
    
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status })
        .eq('id', budget.id);
      
      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: error.message,
        });
        return;
      }
      
      setBudget({ ...budget, status });
      
      toast({
        title: "Status atualizado",
        description: `O orçamento foi marcado como ${status}.`,
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive", 
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status.",
      });
    }
  };
  
  if (isLoading) {
    return <Loading fullscreen text="Carregando orçamento..." />;
  }
  
  if (!budget) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Orçamento não encontrado</CardTitle>
            <CardDescription>Não foi possível encontrar o orçamento solicitado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Detalhes do Orçamento</h1>
          <p className="text-muted-foreground">
            Criado em {formatDate(budget.created_at)}
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 gap-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Orçamento #{budget.id.substring(0, 8)}</CardTitle>
            <Badge className={getStatusColor(budget.status)}>{budget.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg mb-2">Informações do Cliente</h3>
              <p><span className="font-medium">Nome:</span> {budget.cliente}</p>
              <p><span className="font-medium">Veículo:</span> {budget.veiculo}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-2">Informações do Orçamento</h3>
              <p><span className="font-medium">Data:</span> {formatDate(budget.created_at)}</p>
              <p><span className="font-medium">Valor Total:</span> {formatCurrency(budget.valor_total)}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium text-lg mb-2">Descrição dos Serviços</h3>
            <p>{budget.descricao}</p>
          </div>
          
          <Separator />
          
          {budget.status === 'pendente' && (
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => handleStatusUpdate('aprovado')} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" /> Aprovar
              </Button>
              <Button 
                onClick={() => handleStatusUpdate('cancelado')} 
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetDetailsPage;

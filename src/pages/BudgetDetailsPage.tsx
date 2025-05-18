
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/components/ui/loading';

// Componentes refatorados
import BudgetHeader from '@/components/budget/details/BudgetHeader';
import BudgetInfo from '@/components/budget/details/BudgetInfo';
import BudgetStatusActions from '@/components/budget/details/BudgetStatusActions';

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
      <BudgetHeader 
        createdAt={budget.created_at}
        onBack={handleBack}
        onPrint={handlePrint}
        onEdit={handleEdit}
      />
      
      <BudgetInfo
        id={budget.id}
        cliente={budget.cliente}
        veiculo={budget.veiculo}
        created_at={budget.created_at}
        valor_total={budget.valor_total}
        descricao={budget.descricao}
        status={budget.status}
      />
      
      <BudgetStatusActions 
        status={budget.status} 
        onStatusUpdate={handleStatusUpdate} 
      />
    </div>
  );
};

export default BudgetDetailsPage;

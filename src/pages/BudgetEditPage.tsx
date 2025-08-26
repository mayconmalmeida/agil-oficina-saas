import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import Loading from '@/components/ui/loading';
import BudgetForm from '@/components/budget/BudgetForm';
import { BudgetFormValues } from '@/components/budget/budgetSchema';

const BudgetEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBudgetDetails = async () => {
      if (!id) {
        toast({
          variant: "destructive",
          title: "ID do orçamento não encontrado",
          description: "Não foi possível identificar o orçamento a ser editado.",
        });
        navigate('/dashboard/orcamentos');
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Buscando orçamento com ID:', id);
        
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao buscar orçamento:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar orçamento",
            description: error.message || "Não foi possível carregar os detalhes do orçamento.",
          });
          return;
        }
        
        if (!data) {
          toast({
            variant: "destructive",
            title: "Orçamento não encontrado",
            description: "O orçamento solicitado não foi encontrado.",
          });
          navigate('/dashboard/orcamentos');
          return;
        }
        
        console.log('Orçamento carregado:', data);
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
  }, [id, toast, navigate]);
  
  const handleSubmit = async (values: BudgetFormValues) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      console.log('Atualizando orçamento:', { id, values });
      
      const { error } = await supabase
        .from('orcamentos')
        .update({
          cliente: values.cliente,
          veiculo: values.veiculo,
          descricao: values.descricao,
          valor_total: values.valor_total
        })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao atualizar orçamento:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: error.message || "Ocorreu um erro ao atualizar o orçamento.",
        });
        return;
      }
      
      toast({
        title: "Orçamento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      navigate('/dashboard/orcamentos');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar as alterações.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBack = () => {
    navigate('/dashboard/orcamentos');
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
  
  // Prepara os valores iniciais para o formulário
  const initialValues: Partial<BudgetFormValues> = {
    cliente: budget.cliente || '',
    veiculo: budget.veiculo || '',
    descricao: budget.descricao || '',
    valor_total: budget.valor_total || 0
  };
  
  console.log('Valores iniciais do formulário:', initialValues);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Editar Orçamento</h1>
          <p className="text-muted-foreground">Atualize os dados do orçamento</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Orçamento</CardTitle>
          <CardDescription>
            Modifique as informações conforme necessário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm 
            onSubmit={handleSubmit}
            isLoading={isSaving}
            initialValues={initialValues}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetEditPage;
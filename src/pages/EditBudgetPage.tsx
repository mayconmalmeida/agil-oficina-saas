
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetForm from '@/components/budget/BudgetForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Loading from '@/components/ui/loading';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EditBudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/dashboard/orcamentos');
      return;
    }

    const fetchBudget = async () => {
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBudget(data);
      } catch (error: any) {
        console.error('Error fetching budget:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar orçamento",
          description: error.message,
        });
        navigate('/dashboard/orcamentos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [id, navigate, toast]);

  const handleSubmit = async (values: any) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({
          cliente: values.cliente,
          veiculo: values.veiculo,
          descricao: values.descricao,
          valor_total: values.valor_total,
          status: values.status || budget?.status || 'pendente'
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Orçamento atualizado",
        description: "Orçamento foi atualizado com sucesso.",
      });

      navigate('/dashboard/orcamentos');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar orçamento",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/orcamentos');
  };

  if (isLoading) {
    return <Loading text="Carregando orçamento..." />;
  }

  if (!budget) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Orçamento não encontrado</h2>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para orçamentos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Orçamento</h1>
          <p className="text-muted-foreground">Atualize as informações do orçamento</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Orçamento #{budget.id.substring(0, 8)}</CardTitle>
          <CardDescription>
            Modifique os dados do orçamento abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm 
            initialValues={budget}
            onSubmit={handleSubmit}
            onSkip={handleBack}
            isLoading={isSaving}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBudgetPage;

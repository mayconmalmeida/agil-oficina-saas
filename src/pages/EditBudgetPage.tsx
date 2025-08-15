
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BudgetForm from '@/components/budget/BudgetForm';
import { BudgetFormValues, SelectedItem } from '@/components/budget/budgetSchema';
import Loading from '@/components/ui/loading';

const EditBudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [budgetData, setBudgetData] = useState<Partial<BudgetFormValues>>({});

  useEffect(() => {
    if (!id || !user) return;
    
    const loadBudgetData = async () => {
      try {
        setIsLoadingData(true);
        
        const { data: budget, error } = await supabase
          .from('orcamentos')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar orçamento:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao carregar dados do orçamento"
          });
          navigate('/dashboard/orcamentos');
          return;
        }

        setBudgetData({
          cliente: budget.cliente || '',
          veiculo: budget.veiculo || '',
          descricao: budget.descricao || '',
          valor_total: budget.valor_total ? budget.valor_total.toString() : '0',
          status: budget.status || 'Pendente'
        });

      } catch (error) {
        console.error('Erro inesperado:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro inesperado ao carregar orçamento"
        });
        navigate('/dashboard/orcamentos');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadBudgetData();
  }, [id, user, toast, navigate]);

  const handleSubmit = async (values: BudgetFormValues & { itens?: SelectedItem[] }) => {
    if (!id || !user) return;
    
    setIsLoading(true);
    
    try {
      // Convert valor_total to number for database
      const valorTotal = parseFloat(values.valor_total?.replace(',', '.') || '0');
      
      const { error } = await supabase
        .from('orcamentos')
        .update({
          cliente: values.cliente,
          veiculo: values.veiculo,
          descricao: values.descricao,
          valor_total: valorTotal,
          status: values.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar orçamento:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao atualizar orçamento"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Orçamento atualizado com sucesso"
      });
      
      navigate('/dashboard/orcamentos');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao atualizar orçamento"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return <Loading fullscreen text="Carregando dados do orçamento..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Orçamento</h1>
          <p className="text-gray-600">Edite as informações do orçamento</p>
        </div>
        
        <BudgetForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={budgetData}
          isEditing={true}
        />
      </div>
    </div>
  );
};

export default EditBudgetPage;

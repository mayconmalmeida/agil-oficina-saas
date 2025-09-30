
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
  const [budgetItems, setBudgetItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    if (!id || !user) return;
    
    const loadBudgetData = async () => {
      try {
        setIsLoadingData(true);
        
        // Carregar dados básicos do orçamento
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

        // Carregar itens do orçamento
        const { data: items, error: itemsError } = await supabase
          .from('orcamento_itens')
          .select('*')
          .eq('orcamento_id', id);

        if (itemsError) {
          console.error('Erro ao carregar itens do orçamento:', itemsError);
          // Não bloquear se não conseguir carregar itens, apenas mostrar aviso
          toast({
            variant: "destructive",
            title: "Aviso",
            description: "Não foi possível carregar os itens do orçamento"
          });
        }

        setBudgetData({
          cliente: budget.cliente || '',
          veiculo: budget.veiculo || '',
          descricao: budget.descricao || '',
          valor_total: budget.valor_total || 0,
          status: budget.status || 'Pendente'
        });

        // Converter itens para o formato esperado pelo componente
        if (items && items.length > 0) {
          const formattedItems: SelectedItem[] = items.map(item => ({
            id: item.item_id || item.id, // Usar item_id se disponível, senão usar id
            nome: item.nome,
            tipo: item.tipo as 'produto' | 'servico',
            quantidade: item.quantidade || 1,
            valor_unitario: Number(item.valor_unitario) || 0,
            valor_total: Number(item.valor_total) || 0
          }));
          setBudgetItems(formattedItems);
        }

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
      // Atualizar dados básicos do orçamento
      const { error } = await supabase
        .from('orcamentos')
        .update({
          cliente: values.cliente,
          veiculo: values.veiculo,
          descricao: values.descricao,
          valor_total: values.valor_total,
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

      // Atualizar itens do orçamento se fornecidos
      if (values.itens && values.itens.length > 0) {
        // Primeiro, remover itens existentes
        const { error: deleteError } = await supabase
          .from('orcamento_itens')
          .delete()
          .eq('orcamento_id', id);

        if (deleteError) {
          console.error('Erro ao remover itens antigos:', deleteError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao atualizar itens do orçamento"
          });
          return;
        }

        // Inserir novos itens
        const itemsToInsert = values.itens.map(item => ({
          orcamento_id: id,
          user_id: user.id,
          item_id: item.id,
          nome: item.nome,
          tipo: item.tipo,
          quantidade: Number(item.quantidade) || 1,
          valor_unitario: Number(item.valor_unitario) || 0,
          valor_total: Number(item.valor_total) || 0
        }));

        const { error: insertError } = await supabase
          .from('orcamento_itens')
          .insert(itemsToInsert);

        if (insertError) {
          console.error('Erro ao inserir novos itens:', insertError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao salvar itens do orçamento"
          });
          return;
        }
      } else {
        // Se não há itens, remover todos os itens existentes
        const { error: deleteError } = await supabase
          .from('orcamento_itens')
          .delete()
          .eq('orcamento_id', id);

        if (deleteError) {
          console.error('Erro ao remover itens:', deleteError);
        }
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
          <p className="text-gray-600">Atualize as informações do orçamento</p>
        </div>
        
        <BudgetForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialValues={budgetData}
          isEditing={true}
        />
      </div>
    </div>
  );
};

export default EditBudgetPage;

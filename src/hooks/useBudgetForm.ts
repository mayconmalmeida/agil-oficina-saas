
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { BudgetFormValues } from '@/components/budget/budgetSchema';
import { safeRpc } from '@/utils/supabaseTypes';

interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export const useBudgetForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { updateProgress } = useOnboardingProgress(userId);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Acesso não autorizado",
          description: "Você precisa fazer login para acessar este recurso.",
        });
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkUser();
  }, [navigate, toast]);
  
  const handleSubmit = async (values: BudgetFormValues & { itens?: SelectedItem[] }) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar orçamentos.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Calculate total value from items if present
      let totalValue = parseFloat(values.valor_total.replace(',', '.').replace('R$', '').trim());
      if (values.itens && values.itens.length > 0) {
        totalValue = values.itens.reduce((sum, item) => sum + item.valor_total, 0);
      }
      
      // Create budget using RPC function
      const { error } = await safeRpc("create_budget", {
        p_user_id: userId,
        p_cliente: values.cliente,
        p_veiculo: values.veiculo,
        p_descricao: values.descricao,
        p_valor_total: totalValue
      });
      
      if (error) {
        console.error('Erro ao criar orçamento:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar orçamento",
          description: error.message || "Ocorreu um erro ao criar o orçamento.",
        });
        return;
      }
      
      // Mark budget as created
      await updateProgress('budget_created', true);
      
      toast({
        title: "Orçamento criado com sucesso!",
        description: `Orçamento de R$ ${totalValue.toFixed(2)} criado com ${values.itens?.length || 0} itens.`,
      });
      
      // Navigate to budgets list
      navigate('/orcamentos');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao criar o orçamento.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipStep = async () => {
    if (userId) {
      await updateProgress('budget_created', true);
      navigate('/dashboard');
    }
  };

  return {
    userId,
    isLoading,
    handleSubmit,
    skipStep
  };
};

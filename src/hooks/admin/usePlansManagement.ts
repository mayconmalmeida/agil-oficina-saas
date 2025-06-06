
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PlanConfiguration {
  id: string;
  plan_type: string;
  billing_cycle: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  display_order: number;
}

export const usePlansManagement = () => {
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanConfiguration | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      const formattedPlans: PlanConfiguration[] = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features.map(String) : []
      }));
      
      setPlans(formattedPlans);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os planos."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSavePlan = async (plan: PlanConfiguration) => {
    try {
      const { error } = await supabase
        .from('plan_configurations')
        .upsert({
          id: plan.id === 'new' ? undefined : plan.id,
          plan_type: plan.plan_type,
          billing_cycle: plan.billing_cycle,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          features: plan.features,
          is_active: plan.is_active,
          display_order: plan.display_order
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano salvo com sucesso!"
      });

      setEditingPlan(null);
      setIsCreating(false);
      fetchPlans();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o plano."
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('plan_configurations')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso!"
      });

      fetchPlans();
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o plano."
      });
    }
  };

  const startCreating = () => {
    setEditingPlan({
      id: 'new',
      plan_type: 'essencial',
      billing_cycle: 'mensal',
      name: '',
      price: 0,
      currency: 'BRL',
      features: [],
      is_active: true,
      display_order: plans.length + 1
    });
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setIsCreating(false);
  };

  return {
    plans,
    loading,
    editingPlan,
    isCreating,
    fetchPlans,
    handleSavePlan,
    handleDeletePlan,
    startCreating,
    cancelEditing,
    setEditingPlan
  };
};

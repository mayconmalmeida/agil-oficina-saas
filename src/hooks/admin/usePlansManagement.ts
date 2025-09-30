
import React, { useState, useCallback } from 'react';
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
  affiliate_link?: string;
}

export const usePlansManagement = () => {
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlanConfiguration | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[fetchPlans] Iniciando consulta dos planos no Supabase...');
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .order('display_order');

      console.log('[fetchPlans] Resultado bruto:', { data, error });

      if (error) {
        console.error('[fetchPlans] Erro ao buscar planos:', error);
        setError(error.message || 'Erro ao carregar planos.');
        throw error;
      }
      console.log('[fetchPlans] Dados recebidos:', data);

      const formattedPlans: PlanConfiguration[] = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features.map(String) : []
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error('[fetchPlans] Erro na execução do fetchPlans:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os planos."
      });
      setPlans([]);
      if (error instanceof Error) setError(error.message);
      else setError('Erro desconhecido');
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
          display_order: plan.display_order,
          affiliate_link: plan.affiliate_link
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
      display_order: plans.length + 1,
      affiliate_link: ''
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
    error,
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


import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

export const usePlanConfigurations = () => {
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPlans(data || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar configurações dos planos:', err);
      setError('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getPlansByType = (planType: 'essencial' | 'premium') => {
    return plans.filter(plan => plan.plan_type === planType);
  };

  const getPlanPrice = (planType: string, billingCycle: string) => {
    const plan = plans.find(p => p.plan_type === planType && p.billing_cycle === billingCycle);
    return plan ? plan.price : 0;
  };

  return {
    plans,
    loading,
    error,
    fetchPlans,
    getPlansByType,
    getPlanPrice
  };
};

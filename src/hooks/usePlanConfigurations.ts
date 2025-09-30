
import React, { useState, useEffect } from 'react';
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
  affiliate_link?: string;
}

export const usePlanConfigurations = () => {
  const [plans, setPlans] = useState<PlanConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching plans from Supabase...');
      
      const { data, error } = await supabase
        .from('plan_configurations')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Supabase error fetching plans:', error);
        throw error;
      }
      
      console.log('Raw plans data from Supabase:', data);
      
      // Convert the Json type to string[] for features
      const formattedPlans: PlanConfiguration[] = (data || []).map(plan => {
        console.log('Processing plan:', plan.id, 'features:', plan.features);
        return {
          ...plan,
          features: Array.isArray(plan.features) ? plan.features.map(String) : []
        };
      });
      
      console.log('Formatted plans:', formattedPlans);
      setPlans(formattedPlans);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar configurações dos planos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar planos';
      setError(errorMessage);
      
      // Em caso de erro, manter planos vazios para usar fallback
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getPlansByType = (planType: 'essencial' | 'premium') => {
    const filtered = plans.filter(plan => plan.plan_type === planType);
    console.log(`Plans filtered by type ${planType}:`, filtered);
    return filtered;
  };

  const getPlanPrice = (planType: string, billingCycle: string) => {
    const plan = plans.find(p => p.plan_type === planType && p.billing_cycle === billingCycle);
    const price = plan ? plan.price : 0;
    console.log(`Price for ${planType} ${billingCycle}:`, price);
    return price;
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

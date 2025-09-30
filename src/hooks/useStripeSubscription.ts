
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useStripeSubscription = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = async (planType: 'essencial' | 'premium', billingCycle: 'mensal' | 'anual') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType, billingCycle }
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Erro ao criar sessão de checkout:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível iniciar o processo de pagamento."
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Erro ao verificar status da assinatura:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível verificar o status da assinatura."
      });
      return null;
    }
  };

  const openCustomerPortal = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error: any) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível abrir o portal de gerenciamento."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCheckoutSession,
    checkSubscriptionStatus,
    openCustomerPortal
  };
};

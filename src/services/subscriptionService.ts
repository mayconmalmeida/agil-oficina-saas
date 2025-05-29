
import { supabase } from '@/lib/supabase';
import { SubscriptionRPCResponse, UserSubscription } from '@/types/subscription';

export const startFreeTrial = async (planType: 'essencial' | 'premium') => {
  try {
    const { data, error } = await supabase.rpc('start_free_trial', {
      selected_plan_type: planType
    });

    if (error) {
      throw error;
    }

    const response = data as SubscriptionRPCResponse;

    if (!response.success) {
      throw new Error(response.error || 'Erro ao iniciar teste gratuito');
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao iniciar teste gratuito:', err);
    return { success: false, error: err.message };
  }
};

export const getUserSubscription = async (): Promise<SubscriptionRPCResponse> => {
  try {
    const { data, error } = await supabase.rpc('get_user_subscription');

    if (error) {
      throw error;
    }

    return data as SubscriptionRPCResponse;
  } catch (err: any) {
    console.error('Erro ao buscar assinatura:', err);
    return {
      success: false,
      error: err.message,
      has_subscription: false
    };
  }
};

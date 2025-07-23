
import { supabase } from '@/lib/supabase';

export interface StripeSubscriptionData {
  customerId: string;
  subscriptionId: string;
}

export const saveUserSubscription = async (
  userId: string, 
  planType: string, 
  trialEndsAt: string | null, 
  endsAt: string | null, 
  stripeData: StripeSubscriptionData | null = null
) => {
  console.log('[saveUserSubscription] Salvando assinatura:', {
    userId, planType, trialEndsAt, endsAt, stripeData
  });

  const subscriptionData = {
    user_id: userId,
    plan_type: planType,
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: endsAt ? new Date(endsAt + 'T23:59:59.999Z').toISOString() : null,
    trial_ends_at: trialEndsAt ? new Date(trialEndsAt + 'T23:59:59.999Z').toISOString() : null,
    stripe_customer_id: stripeData ? stripeData.customerId : null,
    stripe_subscription_id: stripeData ? stripeData.subscriptionId : null,
    is_manual: !stripeData,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert([subscriptionData], { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('[saveUserSubscription] Erro ao salvar assinatura:', error);
    throw error;
  }

  console.log('[saveUserSubscription] Assinatura salva com sucesso');
  return subscriptionData;
};

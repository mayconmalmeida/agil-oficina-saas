
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

export const getUserPlanStatus = async (userId: string) => {
  try {
    console.log('[getUserPlanStatus] Validando plano para usuário:', userId);
    
    const hoje = new Date();
    
    // 1. PRIORIDADE: Buscar assinatura ativa em user_subscriptions
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subError && subscription) {
      console.log('[getUserPlanStatus] Assinatura encontrada:', subscription);
      
      const sub = subscription;
      const now = new Date();
      const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;
      const endDate = sub.ends_at ? new Date(sub.ends_at) : null;

      let planActive = false;
      let expired = false;

      // Validar se o plano está ativo baseado em trial_ends_at ou ends_at
      if (trialEnd && now <= trialEnd) {
        planActive = true;
      } else if (endDate && now <= endDate) {
        planActive = true;
      } else {
        expired = true;
      }

      // Determinar o tipo de plano baseado no plan_type
      let planType = 'Free';
      if (sub.plan_type && sub.plan_type.includes('premium')) {
        planType = 'Premium';
      } else if (sub.plan_type && sub.plan_type.includes('essencial')) {
        planType = 'Essencial';
      }
      
      console.log('[getUserPlanStatus] Resultado da assinatura:', {
        planType,
        planActive,
        expired,
        trialEnd: trialEnd?.toISOString(),
        endDate: endDate?.toISOString(),
        hoje: hoje.toISOString(),
        source: 'user_subscriptions'
      });
      
      return {
        plan: planType,
        planActive,
        expired,
        source: 'user_subscriptions'
      };
    }

    console.log('[getUserPlanStatus] Nenhuma assinatura ativa encontrada, verificando oficinas...');

    // 2. FALLBACK: Buscar dados na tabela oficinas
    const { data: oficina, error: oficinaError } = await supabase
      .from('oficinas')
      .select('plano, trial_ends_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (!oficinaError && oficina && oficina.trial_ends_at) {
      const expiracao = new Date(oficina.trial_ends_at);
      const planActive = expiracao >= hoje;
      
      console.log('[getUserPlanStatus] Resultado da oficina:', {
        plano: oficina.plano,
        planActive,
        expired: !planActive,
        dataExpiracao: expiracao.toISOString(),
        hoje: hoje.toISOString(),
        source: 'oficinas'
      });
      
      return {
        plan: oficina.plano || 'Free',
        planActive,
        expired: !planActive,
        source: 'oficinas'
      };
    }

    console.log('[getUserPlanStatus] Nenhum plano encontrado');
    
    // 3. SEM PLANO
    return {
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'none'
    };
    
  } catch (error) {
    console.error('[getUserPlanStatus] Erro inesperado:', error);
    return {
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'error'
    };
  }
};

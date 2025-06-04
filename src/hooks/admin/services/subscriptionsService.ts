
import { supabase } from '@/lib/supabase';
import { retryRequest } from '../utils/retryRequest';
import { AdminSubscription } from '../types/adminTypes';

export const fetchSubscriptionsData = async (): Promise<AdminSubscription[]> => {
  console.log('Iniciando busca de assinaturas...');
  
  // Buscar todas as assinaturas com retry
  const { data: subscriptionsData, error: subscriptionsError } = await retryRequest(async () => {
    return supabase
      .from('user_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
  });

  if (subscriptionsError) {
    console.error('Erro ao buscar assinaturas:', subscriptionsError);
    throw subscriptionsError;
  }

  console.log(`Encontradas ${(subscriptionsData as any[])?.length || 0} assinaturas`);

  // Para cada assinatura, buscar o email do usuário
  const subscriptionsWithUserInfo = await Promise.all(
    ((subscriptionsData as any[]) || []).map(async (subscription: any) => {
      try {
        const { data: profile, error: profileError } = await retryRequest(async () => {
          return supabase
            .from('profiles')
            .select('email, nome_oficina')
            .eq('id', subscription.user_id)
            .maybeSingle();
        });

        if (profileError && !profileError.message?.includes('No rows found')) {
          console.warn(`Erro ao buscar perfil para assinatura ${subscription.id}:`, profileError);
        }

        return {
          id: subscription.id,
          user_id: subscription.user_id,
          plan_type: subscription.plan_type,
          status: subscription.status,
          starts_at: subscription.starts_at,
          ends_at: subscription.ends_at,
          trial_ends_at: subscription.trial_ends_at,
          created_at: subscription.created_at,
          user_email: (profile as any)?.email || 'Email não encontrado',
          nome_oficina: (profile as any)?.nome_oficina || 'Nome não encontrado',
        };
      } catch (error) {
        console.warn(`Erro ao processar assinatura ${subscription.id}:`, error);
        return {
          id: subscription.id,
          user_id: subscription.user_id,
          plan_type: subscription.plan_type,
          status: subscription.status,
          starts_at: subscription.starts_at,
          ends_at: subscription.ends_at,
          trial_ends_at: subscription.trial_ends_at,
          created_at: subscription.created_at,
          user_email: 'Email não encontrado',
          nome_oficina: 'Nome não encontrado',
        };
      }
    })
  );

  return subscriptionsWithUserInfo;
};

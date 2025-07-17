
import { supabase } from '@/lib/supabase';
import { retryRequest } from '../utils/retryRequest';
import { AdminUser } from '../types/adminTypes';

export const fetchUsersData = async (): Promise<AdminUser[]> => {
  console.log('Iniciando busca de usuários...');
  
  // Buscar todos os perfis de usuários com retry
  const { data: profiles, error: profilesError } = await retryRequest(async () => {
    return supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
  });

  if (profilesError) {
    console.error('Erro ao buscar perfis:', profilesError);
    throw profilesError;
  }

  console.log(`Encontrados ${(profiles as any[])?.length || 0} perfis`);

  // Para cada usuário, buscar sua assinatura mais recente ATIVA
  const usersWithSubscriptions = await Promise.all(
    ((profiles as any[]) || []).map(async (profile: any) => {
      try {
        // Buscar assinatura ativa mais recente
        const { data: subscription, error: subscriptionError } = await retryRequest(async () => {
          return supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        });

        if (subscriptionError && !subscriptionError.message?.includes('No rows found')) {
          console.warn(`Erro ao buscar assinatura para usuário ${profile.id}:`, subscriptionError);
        }

        // Determinar plano e data de expiração baseado na assinatura
        let planType = null;
        let expirationDate = null;
        let subscriptionStatus = 'inactive';

        if (subscription) {
          // Extrair tipo do plano
          if (subscription.plan_type.includes('premium')) {
            planType = 'premium';
          } else if (subscription.plan_type.includes('essencial')) {
            planType = 'essencial';
          }

          // Determinar data de expiração
          if (subscription.status === 'trialing' && subscription.trial_ends_at) {
            expirationDate = subscription.trial_ends_at;
            subscriptionStatus = 'trialing';
          } else if (subscription.status === 'active' && subscription.ends_at) {
            expirationDate = subscription.ends_at;
            subscriptionStatus = 'active';
          } else if (subscription.status === 'active' && !subscription.ends_at) {
            // Assinatura ativa sem data de fim (indefinida)
            expirationDate = null;
            subscriptionStatus = 'active';
          }
        }

        return {
          id: profile.id,
          email: profile.email || '',
          nome_oficina: profile.nome_oficina,
          telefone: profile.telefone,
          cnpj: profile.cnpj,
          responsavel: profile.responsavel,
          role: profile.role || 'user',
          is_active: profile.is_active ?? true,
          created_at: profile.created_at || '',
          trial_ends_at: expirationDate, // Agora vem da assinatura
          plano: planType, // Agora vem da assinatura
          subscription: subscription ? {
            id: subscription.id,
            plan_type: subscription.plan_type,
            status: subscription.status,
            starts_at: subscription.starts_at,
            ends_at: subscription.ends_at,
            trial_ends_at: subscription.trial_ends_at,
          } : null,
          subscription_status: subscriptionStatus,
        };
      } catch (error) {
        console.warn(`Erro ao processar usuário ${profile.id}:`, error);
        return {
          id: profile.id,
          email: profile.email || '',
          nome_oficina: profile.nome_oficina,
          telefone: profile.telefone,
          cnpj: profile.cnpj,
          responsavel: profile.responsavel,
          role: profile.role || 'user',
          is_active: profile.is_active ?? true,
          created_at: profile.created_at || '',
          trial_ends_at: null,
          plano: null,
          subscription: null,
          subscription_status: 'inactive',
        };
      }
    })
  );

  return usersWithSubscriptions;
};

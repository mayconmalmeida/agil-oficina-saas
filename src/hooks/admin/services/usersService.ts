
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

  // Para cada usuário, buscar sua assinatura mais recente
  const usersWithSubscriptions = await Promise.all(
    ((profiles as any[]) || []).map(async (profile: any) => {
      try {
        const { data: subscription, error: subscriptionError } = await retryRequest(async () => {
          return supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        });

        if (subscriptionError && !subscriptionError.message?.includes('No rows found')) {
          console.warn(`Erro ao buscar assinatura para usuário ${profile.id}:`, subscriptionError);
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
          trial_ends_at: profile.trial_ends_at,
          subscription: subscription ? {
            id: subscription.id,
            plan_type: subscription.plan_type,
            status: subscription.status,
            starts_at: subscription.starts_at,
            ends_at: subscription.ends_at,
            trial_ends_at: subscription.trial_ends_at,
          } : null,
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
          trial_ends_at: profile.trial_ends_at,
          subscription: null,
        };
      }
    })
  );

  return usersWithSubscriptions;
};


import { supabase } from '@/lib/supabase';
import { retryRequest } from '../utils/retryRequest';
import { AdminStats } from '../types/adminTypes';

export const fetchStatsData = async (): Promise<AdminStats> => {
  console.log('Iniciando busca de estatísticas...');
  
  // Data do início do mês atual
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  
  // Buscar estatísticas em paralelo com retry
  const [
    { data: totalUsersResult, error: totalUsersError },
    { data: activeSubscriptionsResult, error: activeSubscriptionsError },
    { data: trialingUsersResult, error: trialingUsersError },
    { data: newUsersResult, error: newUsersError }
  ] = await Promise.all([
    // Total de usuários
    retryRequest(async () => {
      return supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
    }),
    
    // Assinaturas ativas
    retryRequest(async () => {
      return supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
    }),
    
    // Usuários em período de teste
    retryRequest(async () => {
      return supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing');
    }),
    
    // Novos usuários este mês
    retryRequest(async () => {
      return supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);
    })
  ]);

  // Verificar erros individuais
  if (totalUsersError) {
    console.warn('Erro ao buscar total de usuários:', totalUsersError);
  }
  if (activeSubscriptionsError) {
    console.warn('Erro ao buscar assinaturas ativas:', activeSubscriptionsError);
  }
  if (trialingUsersError) {
    console.warn('Erro ao buscar usuários em teste:', trialingUsersError);
  }
  if (newUsersError) {
    console.warn('Erro ao buscar novos usuários:', newUsersError);
  }

  // Para queries com count, acessamos a propriedade count
  return {
    totalUsers: (totalUsersResult as any)?.count ?? 0,
    activeSubscriptions: (activeSubscriptionsResult as any)?.count ?? 0,
    trialingUsers: (trialingUsersResult as any)?.count ?? 0,
    totalRevenue: 0, // Pode ser calculado baseado nas assinaturas ativas
    newUsersThisMonth: (newUsersResult as any)?.count ?? 0,
  };
};

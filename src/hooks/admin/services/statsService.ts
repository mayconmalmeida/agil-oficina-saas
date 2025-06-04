
import { supabase } from '@/lib/supabase';
import { retryRequest } from '../utils/retryRequest';
import { AdminStats } from '../types/adminTypes';

export const fetchStatsData = async (): Promise<AdminStats> => {
  console.log('Iniciando busca de estatísticas...');
  
  // Data do início do mês atual
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  console.log('Data início do mês:', startOfMonth);
  
  // Buscar estatísticas em paralelo com retry
  const [
    totalUsersResult,
    activeSubscriptionsResult,
    trialingUsersResult,
    newUsersResult
  ] = await Promise.all([
    // Total de usuários - contar registros na tabela profiles
    retryRequest(async () => {
      console.log('Buscando total de usuários...');
      const result = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      console.log('Resultado total usuários:', result);
      return result;
    }),
    
    // Assinaturas ativas
    retryRequest(async () => {
      console.log('Buscando assinaturas ativas...');
      const result = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      console.log('Resultado assinaturas ativas:', result);
      return result;
    }),
    
    // Usuários em período de teste
    retryRequest(async () => {
      console.log('Buscando usuários em teste...');
      const result = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing');
      console.log('Resultado usuários em teste:', result);
      return result;
    }),
    
    // Novos usuários este mês
    retryRequest(async () => {
      console.log('Buscando novos usuários do mês...');
      const result = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);
      console.log('Resultado novos usuários:', result);
      return result;
    })
  ]);

  // Verificar erros individuais e extrair contagens
  const totalUsers = totalUsersResult.error ? 0 : (totalUsersResult.count ?? 0);
  const activeSubscriptions = activeSubscriptionsResult.error ? 0 : (activeSubscriptionsResult.count ?? 0);
  const trialingUsers = trialingUsersResult.error ? 0 : (trialingUsersResult.count ?? 0);
  const newUsersThisMonth = newUsersResult.error ? 0 : (newUsersResult.count ?? 0);

  // Log dos erros, se houver
  if (totalUsersResult.error) {
    console.warn('Erro ao buscar total de usuários:', totalUsersResult.error);
  }
  if (activeSubscriptionsResult.error) {
    console.warn('Erro ao buscar assinaturas ativas:', activeSubscriptionsResult.error);
  }
  if (trialingUsersResult.error) {
    console.warn('Erro ao buscar usuários em teste:', trialingUsersResult.error);
  }
  if (newUsersResult.error) {
    console.warn('Erro ao buscar novos usuários:', newUsersResult.error);
  }

  // Log das contagens finais
  console.log('Estatísticas finais:', {
    totalUsers,
    activeSubscriptions,
    trialingUsers,
    newUsersThisMonth
  });

  // Calcular receita estimada baseada nas assinaturas ativas
  // Assumindo valor médio de R$ 49,90 por assinatura
  const totalRevenue = activeSubscriptions * 49.90;

  const stats = {
    totalUsers,
    activeSubscriptions,
    trialingUsers,
    totalRevenue,
    newUsersThisMonth,
  };

  console.log('Retornando estatísticas:', stats);
  return stats;
};

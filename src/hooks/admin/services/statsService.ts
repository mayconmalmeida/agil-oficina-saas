
import { supabase } from '@/lib/supabase';
import { retryRequest } from '../utils/retryRequest';
import { AdminStats } from '@/types/admin';

export const fetchStatsData = async (adminUser?: any): Promise<AdminStats> => {
  console.log('🔍 Iniciando busca de estatísticas admin...');
  
  // Data do início do mês atual
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  console.log('📅 Data início do mês:', startOfMonth);
  
  // Verificar se temos usuário admin válido
  if (!adminUser || !adminUser.isAdmin) {
    console.error('❌ Usuário admin não fornecido ou inválido:', adminUser);
    throw new Error('Usuário administrador não autenticado');
  }

  console.log('✅ Usuário admin válido:', adminUser.email);

  // Buscar estatísticas em paralelo com retry
  const [
    totalUsersResult,
    activeSubscriptionsResult,
    trialingUsersResult,
    newUsersResult
  ] = await Promise.all([
    // Total de usuários - profiles com role diferente de admin
    retryRequest(async () => {
      console.log('👥 Buscando total de usuários...');
      const result = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('role', 'in', '("admin","superadmin")');
      console.log('📊 Total usuários result:', result);
      return result;
    }),
    
    // Assinaturas ativas
    retryRequest(async () => {
      console.log('💳 Buscando assinaturas ativas...');
      const result = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      console.log('📊 Assinaturas ativas result:', result);
      return result;
    }),
    
    // Usuários em período de teste
    retryRequest(async () => {
      console.log('🧪 Buscando usuários em teste...');
      const result = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing');
      console.log('📊 Usuários em teste result:', result);
      return result;
    }),
    
    // Novos usuários este mês
    retryRequest(async () => {
      console.log('🆕 Buscando novos usuários do mês...');
      const result = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('role', 'in', '("admin","superadmin")')
        .gte('created_at', startOfMonth);
      console.log('📊 Novos usuários result:', result);
      return result;
    })
  ]);

  // Log detalhado dos resultados
  console.log('📈 Resultados detalhados:');
  console.log('- Total usuários:', totalUsersResult);
  console.log('- Assinaturas ativas:', activeSubscriptionsResult);
  console.log('- Usuários em teste:', trialingUsersResult);
  console.log('- Novos usuários:', newUsersResult);

  // Verificar erros individuais e extrair contagens
  const totalUsers = totalUsersResult.error ? 0 : (totalUsersResult.count ?? 0);
  const activeSubscriptions = activeSubscriptionsResult.error ? 0 : (activeSubscriptionsResult.count ?? 0);
  const trialingUsers = trialingUsersResult.error ? 0 : (trialingUsersResult.count ?? 0);
  const newUsersThisMonth = newUsersResult.error ? 0 : (newUsersResult.count ?? 0);

  // Log dos erros, se houver
  if (totalUsersResult.error) {
    console.warn('⚠️ Erro ao buscar total de usuários:', totalUsersResult.error);
  }
  if (activeSubscriptionsResult.error) {
    console.warn('⚠️ Erro ao buscar assinaturas ativas:', activeSubscriptionsResult.error);
  }
  if (trialingUsersResult.error) {
    console.warn('⚠️ Erro ao buscar usuários em teste:', trialingUsersResult.error);
  }
  if (newUsersResult.error) {
    console.warn('⚠️ Erro ao buscar novos usuários:', newUsersResult.error);
  }

  // Calcular receita estimada baseada nas assinaturas ativas
  const totalRevenue = activeSubscriptions * 49.90;

  const stats = {
    totalUsers,
    activeSubscriptions,
    trialingUsers,
    totalRevenue,
    newUsersThisMonth,
  };

  console.log('✅ Estatísticas finais calculadas:', stats);

  // Verificar se realmente não há dados ou se é problema de RLS
  if (totalUsers === 0 && activeSubscriptions === 0) {
    console.warn('⚠️ ATENÇÃO: Nenhum dado encontrado! Possíveis causas:');
    console.warn('  1. Sistema realmente não tem dados cadastrados');
    console.warn('  2. Problema nas políticas RLS das tabelas');
    console.warn('  3. Problema de conectividade com o banco');
    
    // Tentar uma consulta básica para verificar conectividade
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .limit(5);
      
      if (testError) {
        console.error('❌ Erro na consulta de teste:', testError);
      } else {
        console.log('🔍 Consulta de teste retornou:', testData?.length, 'registros');
        console.log('Primeiros registros:', testData?.slice(0, 2));
      }
    } catch (error) {
      console.error('❌ Erro na consulta de teste:', error);
    }
  }

  return stats;
};

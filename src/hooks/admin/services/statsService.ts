
import { supabase } from '@/lib/supabase';
import { retryRequest } from '../utils/retryRequest';
import { AdminStats } from '@/types/admin';

export const fetchStatsData = async (): Promise<AdminStats> => {
  console.log('🔍 Iniciando busca de estatísticas...');
  
  // Data do início do mês atual
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  console.log('📅 Data início do mês:', startOfMonth);
  
  // Verificar se o usuário é admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('❌ Erro de autenticação:', authError);
    throw new Error('Usuário não autenticado');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !['admin', 'superadmin'].includes(profile.role)) {
    console.error('❌ Usuário não é admin:', { profileError, profile });
    throw new Error('Acesso negado: usuário não é administrador');
  }

  console.log('✅ Verificação admin OK, buscando dados...');

  // Buscar estatísticas em paralelo com retry
  const [
    totalUsersResult,
    activeSubscriptionsResult,
    trialingUsersResult,
    newUsersResult
  ] = await Promise.all([
    // Total de usuários - TODOS os perfis (incluindo admins para debug)
    retryRequest(async () => {
      console.log('👥 Buscando total de usuários (todos)...');
      const result = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      console.log('📊 Total usuários raw result:', result);
      return result;
    }),
    
    // Assinaturas ativas
    retryRequest(async () => {
      console.log('💳 Buscando assinaturas ativas...');
      const result = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      console.log('📊 Assinaturas ativas raw result:', result);
      return result;
    }),
    
    // Usuários em período de teste
    retryRequest(async () => {
      console.log('🧪 Buscando usuários em teste...');
      const result = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing');
      console.log('📊 Usuários em teste raw result:', result);
      return result;
    }),
    
    // Novos usuários este mês
    retryRequest(async () => {
      console.log('🆕 Buscando novos usuários do mês...');
      const result = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);
      console.log('📊 Novos usuários raw result:', result);
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
  if (totalUsers === 0) {
    console.warn('⚠️ ATENÇÃO: Nenhum usuário encontrado! Isso pode indicar:');
    console.warn('  1. Realmente não há dados no sistema');
    console.warn('  2. Problema nas políticas RLS');
    console.warn('  3. Problema de conexão com o banco');
    
    // Tentar uma consulta básica para verificar conectividade
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Erro na consulta de teste:', testError);
      } else {
        console.log('🔍 Consulta de teste retornou:', testData);
      }
    } catch (error) {
      console.error('❌ Erro na consulta de teste:', error);
    }
  }

  return stats;
};

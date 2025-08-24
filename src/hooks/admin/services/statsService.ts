
import { supabase } from '@/lib/supabase';
import { AdminStats } from '@/types/admin';

export const fetchStatsData = async (adminUser?: any): Promise<AdminStats> => {
  console.log('🔍 Iniciando busca de estatísticas admin...');
  
  // Verificar se temos usuário admin válido
  if (!adminUser || !adminUser.isAdmin) {
    console.error('❌ Usuário admin não fornecido ou inválido:', adminUser);
    throw new Error('Usuário administrador não autenticado');
  }

  console.log('✅ Usuário admin válido:', adminUser.email);

  try {
    // Usar a função RPC do banco para buscar estatísticas
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_admin_stats');

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
      throw statsError;
    }

    console.log('📊 Estatísticas recebidas do banco:', statsData);

    const stats: AdminStats = {
      totalUsers: statsData.totalUsers || 0,
      activeSubscriptions: statsData.activeSubscriptions || 0,
      trialingUsers: statsData.trialingUsers || 0,
      totalRevenue: statsData.totalRevenue || 0,
      newUsersThisMonth: statsData.newUsersThisMonth || 0,
    };

    console.log('✅ Estatísticas finais calculadas:', stats);

    // Log de debug se não há dados
    if (stats.totalUsers === 0 && stats.activeSubscriptions === 0) {
      console.warn('⚠️ ATENÇÃO: Nenhum dado encontrado! Possíveis causas:');
      console.warn('  1. Sistema realmente não tem dados cadastrados');
      console.warn('  2. Problema nas políticas RLS das tabelas');
      console.warn('  3. Problema de conectividade com o banco');
    }

    return stats;

  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    throw new Error(error.message || 'Erro ao carregar estatísticas');
  }
};

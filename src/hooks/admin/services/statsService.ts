
import { supabase } from '@/lib/supabase';
import { AdminStats } from '@/types/admin';

// Interface para tipificar o retorno da função RPC
interface StatsResponse {
  totalOficinas: number;
  activeSubscriptions: number;
  trialingUsers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
}

export const fetchStatsData = async (): Promise<AdminStats> => {
  console.log('🔍 Iniciando busca de estatísticas admin...');

  try {
    // Usar a função RPC do banco para buscar estatísticas
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_admin_stats');

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
      throw statsError;
    }

    console.log('📊 Estatísticas recebidas do banco:', statsData);

    // Verificar se statsData é um objeto válido e fazer type assertion segura
    let parsedStats: StatsResponse;
    
    if (typeof statsData === 'object' && statsData !== null && !Array.isArray(statsData)) {
      parsedStats = statsData as unknown as StatsResponse;
    } else {
      console.warn('⚠️ Dados de estatística inválidos recebidos:', statsData);
      parsedStats = {
        totalOficinas: 0,
        activeSubscriptions: 0,
        trialingUsers: 0,
        totalRevenue: 0,
        newUsersThisMonth: 0,
      };
    }

    const stats: AdminStats = {
      totalOficinas: parsedStats.totalOficinas || 0,
      activeSubscriptions: parsedStats.activeSubscriptions || 0,
      trialingUsers: parsedStats.trialingUsers || 0,
      totalRevenue: parsedStats.totalRevenue || 0,
      newUsersThisMonth: parsedStats.newUsersThisMonth || 0,
    };

    console.log('✅ Estatísticas finais calculadas:', stats);

    // Log de debug se não há dados
    if (stats.totalOficinas === 0 && stats.activeSubscriptions === 0) {
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

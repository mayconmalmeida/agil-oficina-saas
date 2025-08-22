
import React, { useState, useCallback, useRef } from 'react';
import { useAdminContext } from '@/contexts/AdminContext';
import { fetchStatsData } from './services/statsService';
import { AdminStats } from '@/types/admin';

export const useOptimizedAdminData = () => {
  const { user: adminUser } = useAdminContext();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialingUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar ref para evitar múltiplas chamadas simultâneas
  const isLoadingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⚠️ Fetch já em andamento, ignorando nova chamada');
      return;
    }

    // Verificar se temos usuário admin
    if (!adminUser || !adminUser.isAdmin) {
      console.log('⚠️ Usuário admin não disponível ainda');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando busca de estatísticas administrativas com admin:', adminUser.email);

      // Usar o serviço com o usuário admin
      const statsData = await fetchStatsData(adminUser);
      
      console.log('📊 Estatísticas recebidas:', statsData);
      setStats(statsData);
      hasInitializedRef.current = true;

    } catch (err: any) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
      
      // Stats de fallback em caso de erro
      setStats({
        totalUsers: 0,
        activeSubscriptions: 0,
        trialingUsers: 0,
        totalRevenue: 0,
        newUsersThisMonth: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [adminUser]);

  // Inicializar quando tivermos usuário admin
  React.useEffect(() => {
    if (adminUser && adminUser.isAdmin && !hasInitializedRef.current) {
      console.log('🚀 Inicializando dados admin para:', adminUser.email);
      fetchStats();
    }
  }, [adminUser, fetchStats]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetch solicitado pelo usuário');
    hasInitializedRef.current = false; // Reset para permitir nova busca
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    refetch,
  };
};

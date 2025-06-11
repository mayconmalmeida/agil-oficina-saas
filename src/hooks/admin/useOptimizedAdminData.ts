
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminStats } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

interface UseAdminDataReturn {
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOptimizedAdminData = (): UseAdminDataReturn => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialingUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Usar ref para evitar múltiplas chamadas simultâneas
  const isLoadingRef = useRef(false);
  const cacheRef = useRef<{ data: AdminStats; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const fetchWithRetry = useCallback(async (query: any, description: string, maxRetries = 2) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`Buscando ${description} - tentativa ${attempt + 1}`);
        const result = await query();
        
        if (result.error && attempt === maxRetries - 1) {
          console.error(`Erro final em ${description}:`, result.error);
          return { count: 0, hasData: false };
        }
        
        if (result.error) {
          console.warn(`Erro em ${description}, tentativa ${attempt + 1}:`, result.error);
          continue;
        }
        
        return { 
          count: result.count || 0, 
          hasData: result.data && result.data.length > 0 
        };
      } catch (error) {
        console.error(`Erro inesperado em ${description}:`, error);
        if (attempt === maxRetries - 1) {
          return { count: 0, hasData: false };
        }
      }
    }
    return { count: 0, hasData: false };
  }, []);

  const fetchStats = useCallback(async (): Promise<void> => {
    // Verificar cache
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < CACHE_DURATION) {
      console.log('Usando dados do cache');
      setStats(cacheRef.current.data);
      return;
    }

    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('Já existe uma busca em andamento, ignorando...');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('Iniciando busca otimizada de estatísticas admin...');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Executar todas as consultas em paralelo para melhor performance
      const [
        totalUsersResult,
        activeSubscriptionsResult,
        trialingUsersResult,
        newUsersResult
      ] = await Promise.all([
        fetchWithRetry(
          () => supabase.from('profiles').select('*', { count: 'exact', head: true }),
          'total de usuários'
        ),
        fetchWithRetry(
          () => supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          'assinaturas ativas'
        ),
        fetchWithRetry(
          () => supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
          'usuários em teste'
        ),
        fetchWithRetry(
          () => supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
          'novos usuários do mês'
        )
      ]);

      const newStats: AdminStats = {
        totalUsers: totalUsersResult.count,
        activeSubscriptions: activeSubscriptionsResult.count,
        trialingUsers: trialingUsersResult.count,
        totalRevenue: 0, // Implementar cálculo de receita se necessário
        newUsersThisMonth: newUsersResult.count
      };

      setStats(newStats);
      
      // Atualizar cache
      cacheRef.current = {
        data: newStats,
        timestamp: Date.now()
      };
      
      console.log('Estatísticas admin carregadas com sucesso:', newStats);
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas admin:', error);
      setError('Erro ao carregar estatísticas administrativas');
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as estatísticas administrativas"
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchWithRetry, toast]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};

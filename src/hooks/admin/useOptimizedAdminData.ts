
import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminStats } from '@/types/admin';

export const useOptimizedAdminData = () => {
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
    
    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando busca de estatísticas administrativas (otimizada)...');

      // Verificar autenticação admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se é admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || !['admin', 'superadmin'].includes(profile.role)) {
        throw new Error('Acesso negado: usuário não é administrador');
      }

      console.log('✅ Usuário admin verificado, buscando estatísticas...');

      // Data do início do mês
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      // Buscar estatísticas com timeout de 5 segundos
      const statsPromises = [
        // Total de usuários (profiles não-admin)
        Promise.race([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .neq('role', 'admin')
            .neq('role', 'superadmin'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de usuários')), 5000)
          )
        ]),
        
        // Assinaturas ativas
        Promise.race([
          supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de assinaturas ativas')), 5000)
          )
        ]),
        
        // Usuários em trial
        Promise.race([
          supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'trialing'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de trials')), 5000)
          )
        ]),
        
        // Novos usuários este mês
        Promise.race([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .neq('role', 'admin')
            .neq('role', 'superadmin')
            .gte('created_at', startOfMonth),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de novos usuários')), 5000)
          )
        ])
      ];

      const results = await Promise.allSettled(statsPromises);
      
      // Processar resultados com fallback e type casting correto
      const totalUsers = results[0].status === 'fulfilled' && 
        typeof results[0].value === 'object' && 
        results[0].value !== null && 
        'count' in results[0].value && 
        !(results[0].value as any).error
        ? (results[0].value as any).count || 0 
        : 0;
        
      const activeSubscriptions = results[1].status === 'fulfilled' && 
        typeof results[1].value === 'object' && 
        results[1].value !== null && 
        'count' in results[1].value && 
        !(results[1].value as any).error
        ? (results[1].value as any).count || 0 
        : 0;
        
      const trialingUsers = results[2].status === 'fulfilled' && 
        typeof results[2].value === 'object' && 
        results[2].value !== null && 
        'count' in results[2].value && 
        !(results[2].value as any).error
        ? (results[2].value as any).count || 0 
        : 0;
        
      const newUsersThisMonth = results[3].status === 'fulfilled' && 
        typeof results[3].value === 'object' && 
        results[3].value !== null && 
        'count' in results[3].value && 
        !(results[3].value as any).error
        ? (results[3].value as any).count || 0 
        : 0;

      // Calcular receita estimada
      const totalRevenue = activeSubscriptions * 49.90;

      const finalStats = {
        totalUsers,
        activeSubscriptions,
        trialingUsers,
        totalRevenue,
        newUsersThisMonth,
      };

      console.log('📊 Estatísticas finais (otimizada):', finalStats);
      setStats(finalStats);
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
  }, []);

  // Inicializar apenas uma vez
  React.useEffect(() => {
    if (!hasInitializedRef.current) {
      console.log('🚀 Inicializando dados admin (primeira vez)');
      fetchStats();
    }
  }, [fetchStats]);

  const refetch = useCallback(() => {
    console.log('🔄 Refetch solicitado pelo usuário');
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

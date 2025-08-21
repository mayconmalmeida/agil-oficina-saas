
import React, { useState, useCallback } from 'react';
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

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando busca de estatísticas administrativas...');

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

      // Buscar estatísticas com timeout
      const statsPromises = [
        // Total de usuários (profiles não-admin)
        Promise.race([
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .neq('role', 'admin')
            .neq('role', 'superadmin'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de usuários')), 10000)
          )
        ]),
        
        // Assinaturas ativas
        Promise.race([
          supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de assinaturas ativas')), 10000)
          )
        ]),
        
        // Usuários em trial
        Promise.race([
          supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'trialing'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: consulta de trials')), 10000)
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
            setTimeout(() => reject(new Error('Timeout: consulta de novos usuários')), 10000)
          )
        ])
      ];

      const results = await Promise.allSettled(statsPromises);
      
      // Processar resultados com fallback
      const totalUsers = results[0].status === 'fulfilled' && !results[0].value.error 
        ? (results[0].value as any).count || 0 
        : 0;
        
      const activeSubscriptions = results[1].status === 'fulfilled' && !results[1].value.error
        ? (results[1].value as any).count || 0 
        : 0;
        
      const trialingUsers = results[2].status === 'fulfilled' && !results[2].value.error
        ? (results[2].value as any).count || 0 
        : 0;
        
      const newUsersThisMonth = results[3].status === 'fulfilled' && !results[3].value.error
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

      console.log('📊 Estatísticas finais:', finalStats);
      setStats(finalStats);

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
    }
  }, []);

  // Inicializar automaticamente
  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
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

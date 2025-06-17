
import { useState, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar se o usuário atual é admin antes de buscar dados
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        throw new Error('Acesso negado: usuário não é administrador');
      }

      // Buscar estatísticas de forma segura
      const [
        { count: totalUsers },
        { count: activeSubscriptions },
        { count: trialingUsers },
        { count: newUsersThisMonth }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      // Calcular receita estimada (baseada em assinaturas ativas)
      const estimatedRevenue = (activeSubscriptions || 0) * 49.90;

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialingUsers: trialingUsers || 0,
        totalRevenue: estimatedRevenue,
        newUsersThisMonth: newUsersThisMonth || 0,
      });

    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

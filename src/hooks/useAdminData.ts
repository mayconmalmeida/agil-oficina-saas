import { useState, useCallback } from 'react';
import { useAdminContext } from '@/contexts/AdminContext';
import { AdminStats } from '@/types/admin';
import { supabase } from '@/lib/supabase';

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAdminContext();

  const fetchStats = useCallback(async () => {
    console.log('🔍 Iniciando busca de estatísticas admin...');
    
    if (!user || !user.isAdmin) {
      console.log('❌ Usuário admin não fornecido ou inválido:', user);
      setError('Usuário administrador não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Buscando dados de usuários...');
      
      // Buscar total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      // Buscar assinaturas ativas
      const { count: activeSubscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (subsError) {
        console.error('Erro ao buscar assinaturas:', subsError);
        throw subsError;
      }

      // Buscar usuários em trial
      const { count: trialingUsers, error: trialError } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trialing');

      if (trialError) {
        console.error('Erro ao buscar trials:', trialError);
        throw trialError;
      }

      // Buscar receita total (simulado por agora)
      const totalRevenue = 0; // Implementar quando tiver sistema de pagamentos

      // Buscar novos usuários este mês
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const { count: newUsersThisMonth, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', currentMonth.toISOString());

      if (newUsersError) {
        console.error('Erro ao buscar novos usuários:', newUsersError);
        throw newUsersError;
      }

      const statsData: AdminStats = {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialingUsers: trialingUsers || 0,
        totalRevenue,
        newUsersThisMonth: newUsersThisMonth || 0
      };

      console.log('📈 Estatísticas carregadas:', statsData);
      setStats(statsData);
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      setError(error.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    stats,
    isLoading,
    error,
    fetchStats
  };
};
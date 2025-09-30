
import React, { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdminUser, AdminSubscription, AdminStats } from './types/adminTypes';
import { fetchUsersData } from './services/usersService';
import { fetchSubscriptionsData } from './services/subscriptionsService';
import { fetchStatsData } from './services/statsService';

export const useAdminData = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalOficinas: 0,
    activeSubscriptions: 0,
    trialingUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();
  
  // Usar refs para evitar múltiplas chamadas
  const loadingStatsRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const usersData = await fetchUsersData();
      setUsers(usersData);
      console.log('Usuários carregados com sucesso');
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      
      // Tratamento específico para erros 503
      if (error.message?.includes('503')) {
        toast({
          variant: "destructive",
          title: "Servidor temporariamente indisponível",
          description: "O Supabase está sobrecarregado. Tentando novamente em alguns segundos...",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuários",
          description: error.message || "Erro desconhecido",
        });
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, [toast]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoadingSubscriptions(true);
      const subscriptionsData = await fetchSubscriptionsData();
      setSubscriptions(subscriptionsData);
      console.log('Assinaturas carregadas com sucesso');
    } catch (error: any) {
      console.error('Erro ao carregar assinaturas:', error);
      
      if (error.message?.includes('503')) {
        toast({
          variant: "destructive",
          title: "Servidor temporariamente indisponível",
          description: "O Supabase está sobrecarregado. Tentando novamente em alguns segundos...",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao carregar assinaturas",
          description: error.message || "Erro desconhecido",
        });
      }
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (loadingStatsRef.current) {
      console.log('⚠️ fetchStats já em andamento, ignorando');
      return;
    }
    
    try {
      loadingStatsRef.current = true;
      setIsLoadingStats(true);
      console.log('🔄 useAdminData: Carregando estatísticas...');
      
      const statsData = await fetchStatsData();
      console.log('📊 useAdminData: Estatísticas carregadas:', statsData);
      
      setStats(statsData);
    } catch (error: any) {
      console.error('❌ useAdminData: Erro ao carregar estatísticas:', error);
      
      if (error.message?.includes('503')) {
        toast({
          variant: "destructive",
          title: "Servidor temporariamente indisponível",
          description: "O Supabase está sobrecarregado. As estatísticas serão carregadas quando o servidor estiver disponível.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao carregar estatísticas",
          description: error.message || "Erro desconhecido",
        });
      }
    } finally {
      setIsLoadingStats(false);
      loadingStatsRef.current = false;
    }
  }, [toast]);

  return {
    users,
    subscriptions,
    stats,
    isLoadingUsers,
    isLoadingSubscriptions,
    isLoadingStats,
    fetchUsers,
    fetchSubscriptions,
    fetchStats,
    refetch: () => {
      fetchUsers();
      fetchSubscriptions();
      fetchStats();
    }
  };
};

// Re-export types for convenience
export type { AdminUser, AdminSubscription, AdminStats };

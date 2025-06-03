
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: string;
  email: string;
  nome_oficina: string | null;
  telefone: string | null;
  cnpj: string | null;
  responsavel: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  trial_ends_at: string | null;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    starts_at: string;
    ends_at: string | null;
    trial_ends_at: string | null;
  } | null;
}

export interface AdminSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  user_email: string;
  nome_oficina: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialingUsers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialingUsers: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      
      // Buscar todos os perfis de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Para cada usuário, buscar sua assinatura mais recente
      const usersWithSubscriptions = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: profile.id,
            email: profile.email || '',
            nome_oficina: profile.nome_oficina,
            telefone: profile.telefone,
            cnpj: profile.cnpj,
            responsavel: profile.responsavel,
            role: profile.role || 'user',
            is_active: profile.is_active ?? true,
            created_at: profile.created_at || '',
            trial_ends_at: profile.trial_ends_at,
            subscription: subscription || null,
          };
        })
      );

      setUsers(usersWithSubscriptions);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message,
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoadingSubscriptions(true);
      
      // Buscar todas as assinaturas
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        throw subscriptionsError;
      }

      // Para cada assinatura, buscar o email do usuário
      const subscriptionsWithUserInfo = await Promise.all(
        (subscriptionsData || []).map(async (subscription) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, nome_oficina')
            .eq('id', subscription.user_id)
            .maybeSingle();

          return {
            id: subscription.id,
            user_id: subscription.user_id,
            plan_type: subscription.plan_type,
            status: subscription.status,
            starts_at: subscription.starts_at,
            ends_at: subscription.ends_at,
            trial_ends_at: subscription.trial_ends_at,
            created_at: subscription.created_at,
            user_email: profile?.email || '',
            nome_oficina: profile?.nome_oficina || '',
          };
        })
      );

      setSubscriptions(subscriptionsWithUserInfo);
    } catch (error: any) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar assinaturas",
        description: error.message,
      });
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Buscar estatísticas em paralelo
      const [
        { count: totalUsers },
        { count: activeSubscriptions },
        { count: trialingUsers },
        { count: newUsersThisMonth }
      ] = await Promise.all([
        // Total de usuários
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }),
        
        // Assinaturas ativas
        supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        
        // Usuários em período de teste
        supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'trialing'),
        
        // Novos usuários este mês
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialingUsers: trialingUsers || 0,
        totalRevenue: 0, // Pode ser calculado baseado nas assinaturas ativas
        newUsersThisMonth: newUsersThisMonth || 0,
      });
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar estatísticas",
        description: error.message,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

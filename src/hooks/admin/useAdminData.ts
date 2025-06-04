
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

// Função auxiliar para retry de requisições
const retryRequest = async <T>(
  requestFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<{ data: T | null; error: any }> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await requestFn();
      
      // Se não há erro, retorna o resultado
      if (!result.error) {
        return result;
      }
      
      // Se o erro não é temporário (503), não tenta novamente
      if (result.error.message && !result.error.message.includes('503')) {
        return result;
      }
      
      lastError = result.error;
      
      // Aguarda antes de tentar novamente (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  return { data: null, error: lastError };
};

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
      console.log('Iniciando busca de usuários...');
      
      // Buscar todos os perfis de usuários com retry
      const { data: profiles, error: profilesError } = await retryRequest(() =>
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      console.log(`Encontrados ${(profiles as any[])?.length || 0} perfis`);

      // Para cada usuário, buscar sua assinatura mais recente
      const usersWithSubscriptions = await Promise.all(
        ((profiles as any[]) || []).map(async (profile: any) => {
          try {
            const { data: subscription, error: subscriptionError } = await retryRequest(() =>
              supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
            );

            if (subscriptionError && !subscriptionError.message?.includes('No rows found')) {
              console.warn(`Erro ao buscar assinatura para usuário ${profile.id}:`, subscriptionError);
            }

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
          } catch (error) {
            console.warn(`Erro ao processar usuário ${profile.id}:`, error);
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
              subscription: null,
            };
          }
        })
      );

      setUsers(usersWithSubscriptions);
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
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoadingSubscriptions(true);
      console.log('Iniciando busca de assinaturas...');
      
      // Buscar todas as assinaturas com retry
      const { data: subscriptionsData, error: subscriptionsError } = await retryRequest(() =>
        supabase
          .from('user_subscriptions')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (subscriptionsError) {
        console.error('Erro ao buscar assinaturas:', subscriptionsError);
        throw subscriptionsError;
      }

      console.log(`Encontradas ${(subscriptionsData as any[])?.length || 0} assinaturas`);

      // Para cada assinatura, buscar o email do usuário
      const subscriptionsWithUserInfo = await Promise.all(
        ((subscriptionsData as any[]) || []).map(async (subscription: any) => {
          try {
            const { data: profile, error: profileError } = await retryRequest(() =>
              supabase
                .from('profiles')
                .select('email, nome_oficina')
                .eq('id', subscription.user_id)
                .maybeSingle()
            );

            if (profileError && !profileError.message?.includes('No rows found')) {
              console.warn(`Erro ao buscar perfil para assinatura ${subscription.id}:`, profileError);
            }

            return {
              id: subscription.id,
              user_id: subscription.user_id,
              plan_type: subscription.plan_type,
              status: subscription.status,
              starts_at: subscription.starts_at,
              ends_at: subscription.ends_at,
              trial_ends_at: subscription.trial_ends_at,
              created_at: subscription.created_at,
              user_email: (profile as any)?.email || 'Email não encontrado',
              nome_oficina: (profile as any)?.nome_oficina || 'Nome não encontrado',
            };
          } catch (error) {
            console.warn(`Erro ao processar assinatura ${subscription.id}:`, error);
            return {
              id: subscription.id,
              user_id: subscription.user_id,
              plan_type: subscription.plan_type,
              status: subscription.status,
              starts_at: subscription.starts_at,
              ends_at: subscription.ends_at,
              trial_ends_at: subscription.trial_ends_at,
              created_at: subscription.created_at,
              user_email: 'Email não encontrado',
              nome_oficina: 'Nome não encontrado',
            };
          }
        })
      );

      setSubscriptions(subscriptionsWithUserInfo);
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
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      console.log('Iniciando busca de estatísticas...');
      
      // Data do início do mês atual
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      // Buscar estatísticas em paralelo com retry
      const [
        { data: totalUsersResult, error: totalUsersError },
        { data: activeSubscriptionsResult, error: activeSubscriptionsError },
        { data: trialingUsersResult, error: trialingUsersError },
        { data: newUsersResult, error: newUsersError }
      ] = await Promise.all([
        // Total de usuários
        retryRequest(() =>
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
        ),
        
        // Assinaturas ativas
        retryRequest(() =>
          supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
        ),
        
        // Usuários em período de teste
        retryRequest(() =>
          supabase
            .from('user_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'trialing')
        ),
        
        // Novos usuários este mês
        retryRequest(() =>
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth)
        )
      ]);

      // Verificar erros individuais
      if (totalUsersError) {
        console.warn('Erro ao buscar total de usuários:', totalUsersError);
      }
      if (activeSubscriptionsError) {
        console.warn('Erro ao buscar assinaturas ativas:', activeSubscriptionsError);
      }
      if (trialingUsersError) {
        console.warn('Erro ao buscar usuários em teste:', trialingUsersError);
      }
      if (newUsersError) {
        console.warn('Erro ao buscar novos usuários:', newUsersError);
      }

      // Para queries com count, acessamos a propriedade count
      const newStats = {
        totalUsers: (totalUsersResult as any)?.count ?? 0,
        activeSubscriptions: (activeSubscriptionsResult as any)?.count ?? 0,
        trialingUsers: (trialingUsersResult as any)?.count ?? 0,
        totalRevenue: 0, // Pode ser calculado baseado nas assinaturas ativas
        newUsersThisMonth: (newUsersResult as any)?.count ?? 0,
      };

      setStats(newStats);
      console.log('Estatísticas carregadas:', newStats);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      
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

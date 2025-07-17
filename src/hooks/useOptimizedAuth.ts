
import { useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { signOutUser, validatePlanAccess } from '@/services/authService';
import { AuthContextValue } from '@/types/auth';
import { UserSubscription } from '@/types/subscription';
import { supabase } from '@/lib/supabase';

export const useOptimizedAuth = (): AuthContextValue => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();

  console.log('useOptimizedAuth: Estado atual detalhado:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    isLoadingAuth,
    role,
    userEmail: user?.email || 'não logado',
    subscription: !!user?.subscription
  });

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);

  // Buscar assinatura ativa da oficina vinculada ao usuário
  const getActiveSubscription = useCallback(async () => {
    if (!user?.id) return null;

    try {
      console.log('useOptimizedAuth: Buscando oficina para usuário:', user.id);
      
      // Primeiro, buscar a oficina do usuário
      const { data: oficina, error: oficinaError } = await supabase
        .from('oficinas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (oficinaError || !oficina) {
        console.log('useOptimizedAuth: Oficina não encontrada:', oficinaError);
        return null;
      }

      console.log('useOptimizedAuth: Oficina encontrada:', oficina.id);

      // Buscar assinatura ativa da oficina
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id) // Mantém user_id pois a tabela está estruturada assim
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error('useOptimizedAuth: Erro ao buscar assinatura:', subscriptionError);
        return null;
      }

      console.log('useOptimizedAuth: Assinatura encontrada:', subscription);
      return subscription;
    } catch (error) {
      console.error('useOptimizedAuth: Erro geral ao buscar assinatura:', error);
      return null;
    }
  }, [user?.id]);

  // Validar se a assinatura está realmente ativa
  const validateSubscription = useCallback((subscription: any) => {
    if (!subscription) {
      console.log('useOptimizedAuth: Nenhuma assinatura para validar');
      return { isActive: false, plan: 'Free' as const };
    }

    const now = new Date();
    console.log('useOptimizedAuth: Validando assinatura:', {
      status: subscription.status,
      plan_type: subscription.plan_type,
      ends_at: subscription.ends_at,
      trial_ends_at: subscription.trial_ends_at,
      is_manual: subscription.is_manual,
      now: now.toISOString()
    });

    let isActive = false;
    let plan: 'Essencial' | 'Premium' | 'Free' = 'Free';

    // Verificar se está ativo
    if (subscription.status === 'active') {
      // Para assinaturas pagas ou manuais
      if (subscription.is_manual || !subscription.ends_at) {
        // Assinatura manual ou sem data de fim = ativa
        isActive = true;
      } else if (subscription.ends_at) {
        // Verificar se não expirou
        isActive = new Date(subscription.ends_at) > now;
      }
    } else if (subscription.status === 'trialing') {
      // Para trials, verificar data de fim do trial
      if (subscription.trial_ends_at) {
        isActive = new Date(subscription.trial_ends_at) > now;
      }
    }

    // Determinar o plano baseado no plan_type
    if (isActive && subscription.plan_type) {
      if (subscription.plan_type.includes('premium')) {
        plan = 'Premium';
      } else if (subscription.plan_type.includes('essencial')) {
        plan = 'Essencial';
      }
    }

    console.log('useOptimizedAuth: Resultado da validação:', {
      isActive,
      plan,
      subscription_id: subscription.id
    });

    return { isActive, plan };
  }, []);

  // Validar acesso e permissões do plano
  const planValidation = user ? validatePlanAccess(user.subscription, user.role || 'user') : {
    isActive: false,
    plan: 'Free' as const,
    permissions: []
  };

  // Calcular propriedades do usuário baseado no perfil
  const authUser = user && session ? {
    // Manter todas as propriedades originais do usuário do Supabase
    ...session.user,
    // Sobrescrever com dados do perfil
    role: user.role || 'user',
    isAdmin: user.role === 'admin' || user.role === 'superadmin',
    canAccessFeatures: planValidation.isActive,
    plan: planValidation.plan,
    planActive: planValidation.isActive,
    permissions: planValidation.permissions,
    // Dados adicionais do perfil
    nome_oficina: user.nome_oficina,
    telefone: user.telefone,
    is_active: user.is_active,
    // Fix subscription type compatibility - ensure all required fields are present
    subscription: user.subscription ? {
      id: user.subscription.id,
      user_id: user.subscription.user_id,
      plan_type: user.subscription.plan_type as 'essencial_mensal' | 'essencial_anual' | 'premium_mensal' | 'premium_anual' | 'free_trial_essencial' | 'free_trial_premium',
      status: user.subscription.status as 'active' | 'trialing' | 'cancelled' | 'expired',
      starts_at: user.subscription.starts_at,
      ends_at: user.subscription.ends_at || null,
      trial_ends_at: user.subscription.trial_ends_at || null,
      is_manual: user.subscription.is_manual || null,
      stripe_customer_id: user.subscription.stripe_customer_id || null,
      stripe_subscription_id: user.subscription.stripe_subscription_id || null,
      created_at: user.subscription.created_at,
      updated_at: user.subscription.updated_at
    } as UserSubscription : undefined,
    trial_ends_at: user.trial_ends_at,
    plano: user.plano,
    trial_started_at: user.trial_started_at
  } : null;

  console.log('useOptimizedAuth: Validação de plano:', {
    hasAuthUser: !!authUser,
    role: authUser?.role,
    isAdmin: authUser?.isAdmin,
    plan: authUser?.plan,
    planActive: authUser?.planActive,
    canAccessFeatures: authUser?.canAccessFeatures,
    permissionsCount: authUser?.permissions?.length || 0
  });

  return {
    user: authUser,
    session,
    loading,
    isLoadingAuth,
    role: role || null,
    isAdmin: authUser?.isAdmin || false,
    plan: authUser?.plan || null,
    planActive: authUser?.planActive || false,
    permissions: authUser?.permissions || [],
    signOut
  };
};

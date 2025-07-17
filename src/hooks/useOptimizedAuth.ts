
import { useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { signOutUser, validatePlanAccessFromProfile } from '@/services/authService';
import { AuthContextValue } from '@/types/auth';
import { UserSubscription } from '@/types/subscription';

export const useOptimizedAuth = (): AuthContextValue => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();

  console.log('useOptimizedAuth: Estado atual detalhado:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    isLoadingAuth,
    role,
    userEmail: user?.email || 'não logado',
    subscription: !!user?.subscription,
    subscriptionStatus: user?.subscription?.status,
    subscriptionPlanType: user?.subscription?.plan_type,
    oficinaId: user?.oficina_id
  });

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);

  // ✅ Validar acesso e permissões do plano usando a nova lógica centralizada
  const planValidation = user ? validatePlanAccessFromProfile(user.subscription, user.role || 'user') : {
    isActive: false,
    plan: 'Free' as const,
    permissions: []
  };

  console.log('useOptimizedAuth: Validação de plano aplicada:', {
    hasUser: !!user,
    subscription: !!user?.subscription,
    planValidation: {
      isActive: planValidation.isActive,
      plan: planValidation.plan,
      permissionsCount: planValidation.permissions.length
    }
  });

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
    oficina_id: user.oficina_id,
    // Fix subscription type compatibility
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

  console.log('useOptimizedAuth: Resultado final da validação:', {
    hasAuthUser: !!authUser,
    role: authUser?.role,
    isAdmin: authUser?.isAdmin,
    plan: authUser?.plan,
    planActive: authUser?.planActive,
    canAccessFeatures: authUser?.canAccessFeatures,
    permissionsCount: authUser?.permissions?.length || 0,
    permissions: authUser?.permissions || [],
    oficinaId: authUser?.oficina_id
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

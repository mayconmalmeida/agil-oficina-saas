
import { useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { signOutUser, validatePlanAccess } from '@/services/authService';
import { AuthContextValue } from '@/types/auth';

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
    subscription: user.subscription,
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

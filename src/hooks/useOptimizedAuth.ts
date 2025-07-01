
import { useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { signOutUser, calculateCanAccessFeatures } from '@/services/authService';
import { AuthContextValue } from '@/types/auth';

export const useOptimizedAuth = (): AuthContextValue => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();

  console.log('useOptimizedAuth: Estado atual detalhado:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    isLoadingAuth,
    role,
    userEmail: user?.email || 'não logado'
  });

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);

  // Calcular propriedades do usuário baseado no perfil
  const authUser = user ? {
    ...user,
    role: user.role || 'user',
    isAdmin: user.role === 'admin' || user.role === 'superadmin',
    canAccessFeatures: calculateCanAccessFeatures(user.subscription, user.role || 'user')
  } : null;

  console.log('useOptimizedAuth: Usuário final:', {
    hasAuthUser: !!authUser,
    role: authUser?.role,
    isAdmin: authUser?.isAdmin,
    canAccessFeatures: authUser?.canAccessFeatures
  });

  return {
    user: authUser,
    session,
    loading,
    isLoadingAuth,
    role: role || null,
    isAdmin: authUser?.isAdmin || false,
    signOut
  };
};

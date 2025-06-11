
import { useCallback, useMemo } from 'react';
import { useAuthState } from './useAuthState';
import { signOutUser } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { AuthContextValue } from '@/types/auth';

export const useOptimizedAuth = (): AuthContextValue => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();
  const { toast } = useToast();

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao realizar logout."
      });
    }
  }, [toast]);

  const isAdmin = useMemo(() => {
    return role === 'admin' || role === 'superadmin';
  }, [role]);

  const contextValue = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin,
    signOut
  }), [user, session, loading, isLoadingAuth, role, isAdmin, signOut]);

  return contextValue;
};

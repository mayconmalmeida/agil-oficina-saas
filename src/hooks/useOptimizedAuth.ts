
import { useCallback, useMemo, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { signOutUser } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { AuthContextValue } from '@/types/auth';
import { supabase } from '@/lib/supabase';

export const useOptimizedAuth = (): AuthContextValue => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();
  const { toast } = useToast();

  // Configurar plano automaticamente para novos usuários
  useEffect(() => {
    const setupUserPlan = async () => {
      if (!user?.id) return;

      try {
        console.log('Verificando configuração do plano para usuário:', user.id);
        
        // Verificar se o usuário já tem um plano configurado
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plano, trial_started_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          return;
        }

        // Se não tem plano ou trial_started_at, configurar plano Essencial com trial
        if (!profile.plano || !profile.trial_started_at) {
          console.log('Configurando plano Essencial para novo usuário');
          
          const { error: updateError } = await supabase.rpc('update_user_plan', {
            user_profile_id: user.id,
            new_plan: 'Essencial'
          });

          if (updateError) {
            console.error('Erro ao configurar plano:', updateError);
          } else {
            console.log('Plano Essencial configurado com sucesso');
          }
        }
      } catch (error) {
        console.error('Erro ao configurar plano do usuário:', error);
      }
    };

    setupUserPlan();
  }, [user?.id]);

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

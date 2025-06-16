
import { useAuthState } from './useAuthState';
import { supabase } from '@/lib/supabase';

export const useOptimizedAuth = () => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();

  const signOut = async () => {
    try {
      console.log('useOptimizedAuth: Iniciando logout...');
      await supabase.auth.signOut();
      console.log('useOptimizedAuth: Logout realizado com sucesso');
    } catch (error) {
      console.error('useOptimizedAuth: Erro no logout:', error);
      throw error;
    }
  };

  const isAdmin = role === 'admin' || role === 'superadmin';

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin,
    signOut
  };
};

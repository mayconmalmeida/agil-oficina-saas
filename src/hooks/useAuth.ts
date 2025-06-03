
import { AuthContextValue } from '@/types/auth';
import { useAuthState } from './useAuthState';
import { signOutUser } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export const useAuth = (): AuthContextValue => {
  const { user, session, loading, isLoadingAuth, role } = useAuthState();
  const { toast } = useToast();

  const signOut = async () => {
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
  };

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin: role === 'admin' || role === 'superadmin',
    signOut
  };
};

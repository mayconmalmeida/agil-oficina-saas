
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    try {
      console.log('🔓 Iniciando processo de logout...');
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro ao fazer logout do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Logout realizado com sucesso');
      
      // Navigate to login
      navigate('/login', { replace: true });
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
    } catch (error: any) {
      console.error('❌ Erro no logout:', error);
      
      // Even if there's an error, clear everything and redirect
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
      
      toast({
        variant: "destructive",
        title: "Erro no logout",
        description: "Ocorreu um erro, mas você foi desconectado.",
      });
    }
  }, [navigate, toast]);

  return { logout };
};

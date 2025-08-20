
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLogout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando processo de logout...');
      
      // Limpar localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('theme');
      
      // Fazer logout do Supabase
      await signOut();
      
      console.log('✅ Logout realizado com sucesso');
      
      // Redirecionar para a página inicial
      navigate('/', { replace: true });
      
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso."
      });
      
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      
      // Mesmo em caso de erro, redirecionar para segurança
      navigate('/', { replace: true });
      
      toast({
        variant: "destructive",
        title: "Erro no logout",
        description: "Houve um problema, mas você foi desconectado por segurança."
      });
    }
  };

  return { handleLogout };
};

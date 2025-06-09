
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkConnection = async () => {
    return await testSupabaseConnection();
  };

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    
    try {
      console.log('Iniciando processo de login para:', data.email);
      
      // Verificar conexão
      const isConnected = await checkConnection();
      if (!isConnected) {
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Tente novamente.",
        });
        setIsLoading(false);
        return;
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos" 
            : "Erro ao fazer login. Tente novamente.",
        });
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        console.log('Login bem-sucedido para:', authData.user.email);
        setUserId(authData.user.id);

        // Verificar se é admin
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileError) {
            console.log('Erro ao verificar perfil ou perfil não existe:', profileError.message);
          }

          // Se é admin, redirecionar para painel admin
          if (profileData && (profileData.role === 'admin' || profileData.role === 'superadmin')) {
            console.log('Admin detectado, redirecionando para /admin');
            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo ao painel de administração.",
            });
            navigate('/admin');
            setIsLoading(false);
            return;
          }
        } catch (adminError) {
          console.error('Erro ao verificar admin:', adminError);
        }

        // Para usuários normais
        console.log('Usuário normal, redirecionando para dashboard');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    userId,
    handleLogin,
    setUserId,
    checkConnection,
  };
};

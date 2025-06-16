
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

  const checkProfileCompletion = async (uid: string) => {
    try {
      console.log('Verificando completude do perfil para usuário:', uid);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('nome_oficina, telefone, email, role')
        .eq('id', uid)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar perfil:', error);
        return false;
      }

      if (!profile) {
        console.log('Perfil não encontrado, precisa ser criado');
        return false;
      }

      console.log('Perfil encontrado:', profile);

      // Verificar se os campos obrigatórios estão preenchidos
      const requiredFields = ['nome_oficina', 'telefone'];
      const isComplete = requiredFields.every(field => 
        profile[field] && profile[field].trim() !== ''
      );

      console.log('Verificação de perfil completo:', isComplete);
      return isComplete;
    } catch (error) {
      console.error('Erro inesperado ao verificar perfil:', error);
      return false;
    }
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

        // Verificar se é admin primeiro
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (!profileError && profileData && (profileData.role === 'admin' || profileData.role === 'superadmin')) {
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

        // Para usuários normais, verificar se o perfil está completo
        console.log('Verificando completude do perfil para usuário normal...');
        const isProfileComplete = await checkProfileCompletion(authData.user.id);
        
        if (!isProfileComplete) {
          console.log('Perfil incompleto detectado, redirecionando para /perfil-setup');
          toast({
            title: "Complete seu perfil",
            description: "Por favor, complete as informações da sua oficina para continuar.",
          });
          navigate('/perfil-setup');
        } else {
          console.log('Perfil completo, redirecionando para dashboard');
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta!",
          });
          navigate('/dashboard');
        }
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

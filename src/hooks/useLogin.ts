
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, testSupabaseConnection } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { LoginFormValues } from '@/components/auth/LoginForm';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const connected = await testSupabaseConnection();
      return connected;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('useLogin: Iniciando processo de login para:', values.email);
      
      // Verificar conexão primeiro
      const connected = await checkConnection();
      if (!connected) {
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Tente novamente.",
        });
        setIsLoading(false);
        return;
      }

      // Tentar fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error('useLogin: Erro de autenticação:', error);
        
        let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        }
        
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      if (!data.session || !data.user) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "Não foi possível estabelecer a sessão. Tente novamente.",
        });
        setIsLoading(false);
        return;
      }

      console.log('useLogin: Login bem-sucedido para:', data.user.email);
      setUserId(data.user.id);

      // Verificar se é admin
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, nome_oficina, telefone, trial_started_at')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('useLogin: Erro ao verificar perfil:', profileError);
        }

        console.log('useLogin: Dados do perfil:', profileData);

        // Se é admin, redirecionar para admin
        if (profileData && (profileData.role === 'admin' || profileData.role === 'superadmin')) {
          console.log('useLogin: Usuário é admin, redirecionando para /admin');
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo ao painel administrativo!",
          });
          navigate('/admin', { replace: true });
          setIsLoading(false);
          return;
        }

        // Para usuários normais, verificar se perfil está completo
        if (!profileData) {
          console.log('useLogin: Perfil não encontrado, redirecionando para setup');
          navigate('/perfil-setup', { replace: true });
          setIsLoading(false);
          return;
        }

        // Verificar se perfil está completo
        const isProfileComplete = profileData.nome_oficina && profileData.telefone &&
                                profileData.nome_oficina.trim() !== '' && profileData.telefone.trim() !== '';

        if (!isProfileComplete) {
          console.log('useLogin: Perfil incompleto, redirecionando para setup');
          navigate('/perfil-setup', { replace: true });
          setIsLoading(false);
          return;
        }

        // Garantir que o trial seja configurado para novos usuários
        if (!profileData.trial_started_at) {
          console.log('useLogin: Configurando trial premium de 7 dias para usuário');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              trial_started_at: new Date().toISOString(),
              plano: 'Premium'
            })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('useLogin: Erro ao configurar trial:', updateError);
          } else {
            console.log('useLogin: Trial premium configurado com sucesso');
          }
        }

        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao OficinaÁgil!",
        });

        console.log('useLogin: Redirecionando para dashboard');
        navigate('/dashboard', { replace: true });

      } catch (adminCheckError) {
        console.error('useLogin: Erro ao verificar dados do usuário:', adminCheckError);
        // Em caso de erro, redirecionar para setup
        navigate('/perfil-setup', { replace: true });
      }

    } catch (error) {
      console.error('useLogin: Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    userId,
    setUserId,
    handleLogin,
    checkConnection
  };
};

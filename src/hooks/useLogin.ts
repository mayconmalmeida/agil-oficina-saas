
import React, { useState } from 'react';
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
    console.log('useLogin: handleLogin INICIADO', { email: values.email });
    setIsLoading(true);
    
    try {
      console.log('useLogin: Iniciando processo de login para:', values.email);
      
      // Verificar conexão primeiro
      console.log('useLogin: Verificando conexão com Supabase...');
      const connected = await checkConnection();
      console.log('useLogin: Resultado da verificação de conexão:', connected);
      
      if (!connected) {
        console.error('useLogin: Falha na conexão com Supabase');
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Tente novamente.",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('useLogin: Conexão com Supabase estabelecida com sucesso');

      // Tentar fazer login
      console.log('useLogin: Tentando fazer login com Supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      console.log('useLogin: Resposta do signInWithPassword recebida', { 
        success: !error, 
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        errorMessage: error?.message
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
          // Usar window.location para garantir refresh completo
          setTimeout(() => {
            window.location.href = '/admin';
          }, 500);
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

        // ✅ VALIDAÇÃO ESPECÍFICA DA TABELA OFICINAS para usuários não-admin
        console.log('useLogin: Validando usuário na tabela oficinas...');
        const { data: oficinaData, error: oficinaError } = await supabase
          .from('oficinas')
          .select('id, nome_oficina, is_active, ativo, user_id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (oficinaError && oficinaError.code !== 'PGRST116') {
          console.error('useLogin: Erro ao validar oficina:', oficinaError);
          toast({
            variant: "destructive",
            title: "Erro de validação",
            description: "Não foi possível validar seus dados de oficina. Tente novamente.",
          });
          setIsLoading(false);
          return;
        }

        if (!oficinaData) {
          console.log('useLogin: Usuário não encontrado na tabela oficinas, redirecionando para setup');
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: "Sua conta não está registrada como uma oficina válida. Entre em contato com o suporte.",
          });
          navigate('/perfil-setup', { replace: true });
          setIsLoading(false);
          return;
        }

        if (!oficinaData.is_active) {
          console.log('useLogin: Oficina inativa na tabela oficinas');
          toast({
            variant: "destructive",
            title: "Conta inativa",
            description: "Sua oficina está inativa. Entre em contato com o suporte para reativar.",
          });
          setIsLoading(false);
          return;
        }

        console.log('useLogin: ✅ Validação da tabela oficinas bem-sucedida:', oficinaData.nome_oficina);

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

        console.log('useLogin: Redirecionando para dashboard principal');
        // Aumentar o timeout para garantir que o contexto de auth seja atualizado
        // e forçar o redirecionamento com window.location para garantir refresh completo
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);

      } catch (adminCheckError) {
        console.error('useLogin: Erro ao verificar dados do usuário:', adminCheckError);
        // Em caso de erro, redirecionar para dashboard mesmo assim usando window.location
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
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

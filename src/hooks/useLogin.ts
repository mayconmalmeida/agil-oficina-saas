
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase, testSupabaseConnection, createProfileIfNotExists } from "@/lib/supabase";
import { LoginFormValues } from '@/components/auth/LoginForm';
import { getNextOnboardingStep } from '@/utils/onboardingUtils';
import { useOnboardingRedirect } from './useOnboardingRedirect';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handleRedirect } = useOnboardingRedirect();

  // Função para verificar conexão com o Supabase
  const checkConnection = async () => {
    console.log("Verificando conexão com Supabase...");
    const connected = await testSupabaseConnection();
    setIsConnected(connected);
    console.log("Status da conexão:", connected ? "Conectado" : "Desconectado");
    return connected;
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Primeiro verificar a conexão com o Supabase
      const connected = await checkConnection();
      
      if (!connected) {
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor de autenticação. Conecte o Supabase para continuar ou o sistema funcionará em modo de demonstração.",
        });
        console.log("Funcionando em modo demo (Supabase desconectado)");
      }
      
      console.log("Iniciando login com:", values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: `${error.message} (Código: ${error.status || 'desconhecido'})`,
        });
        setIsLoading(false);
        return;
      }

      console.log("Login bem-sucedido, aguardando carregamento dos dados do usuário");
      
      // Lidar com o cliente Supabase dummy ou desconexão
      if (!data || !data.user) {
        console.log("Funcionando em modo demo (sem Supabase conectado)");
        
        toast({
          title: "Login simulado com sucesso",
          description: "Sistema funcionando em modo de demonstração.",
        });
        
        // Simular um ID de usuário para teste
        const demoUserId = "demo-user-" + Date.now();
        setUserId(demoUserId);
        
        console.log("Redirecionando para dashboard (modo demo)");
        setIsLoading(false);
        navigate('/dashboard');
        return;
      }
      
      // Tentamos garantir que o usuário tenha um perfil
      if (connected) {
        console.log("Verificando/criando perfil para usuário:", data.user.id);
        const profileResult = await createProfileIfNotExists(
          data.user.id, 
          data.user.email || values.email,
          data.user.user_metadata?.full_name
        );
        
        if (!profileResult.success) {
          console.warn("Alerta: Não foi possível verificar/criar o perfil do usuário:", 
            profileResult.error);
          // Continuamos mesmo sem conseguir criar o perfil
          // para permitir que o usuário entre no sistema
        } else {
          console.log("Perfil verificado/criado com sucesso");
        }
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao OficinaÁgil.",
      });

      // Aguardar que o useAuthState processe os dados do usuário
      // O redirecionamento será feito pelo useAccessControl baseado na role
      console.log("Login concluído, aguardando processamento dos dados do usuário...");
      setUserId(data.user.id);
      setIsLoading(false);

    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login. Verifique sua conexão.",
      });
      setIsLoading(false);
    }
  };

  return { isLoading, isConnected, userId, handleLogin, setUserId, checkConnection };
};

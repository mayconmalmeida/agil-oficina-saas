
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
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
    const connected = await testSupabaseConnection();
    setIsConnected(connected);
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
          description: "Não foi possível conectar ao servidor de autenticação. Conecte o Supabase para continuar.",
        });
        setIsLoading(false);
        return;
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

      console.log("Login bem-sucedido, verificando tipo de usuário");
      
      // Lidar com o cliente Supabase dummy
      // Em modo demo, não teremos dados.user válidos
      if (!data || !data.user) {
        console.log("Funcionando em modo demo (sem Supabase conectado)");
        
        toast({
          title: "Login simulado com sucesso",
          description: "Sistema funcionando em modo de demonstração.",
        });
        
        // Simular um ID de usuário para teste
        const demoUserId = "demo-user-" + Date.now();
        setUserId(demoUserId);
        
        console.log("Redirecionando para perfil-oficina (modo demo)");
        setIsLoading(false);
        navigate('/perfil-oficina');
        return;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao OficinaÁgil.",
      });

      // Verificar se é admin
      try {
        console.log("Verificando se o usuário é administrador:", data.user.email);
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', values.email)
          .single();

        if (adminError) {
          console.log("Usuário não é admin ou ocorreu erro na verificação:", adminError.message);
        }

        if (adminData) {
          console.log("Usuário é admin, redirecionando para dashboard admin");
          setIsLoading(false);
          navigate("/admin/dashboard");
          return;
        }
        
        // Para usuários normais, obter o próximo passo e redirecionar
        const userId = data.user?.id;
        if (userId) {
          console.log("Usuário normal autenticado com ID:", userId);
          setUserId(userId);
          
          // Forçar redirecionamento para perfil-oficina como primeiro passo
          console.log("Redirecionando para perfil-oficina");
          setIsLoading(false);
          navigate('/perfil-oficina');
        }
      } catch (adminCheckError) {
        console.error("Erro ao verificar tipo de usuário:", adminCheckError);
        // Se falhar a verificação, tentamos redirecionar para a primeira etapa
        if (data.user?.id) {
          setUserId(data.user.id);
          console.log("Redirecionando para perfil-oficina após erro");
          setIsLoading(false);
          navigate('/perfil-oficina');
        }
      }
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

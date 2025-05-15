
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { LoginFormValues } from '@/components/auth/LoginForm';
import { getNextOnboardingStep } from '@/utils/onboardingUtils';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
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
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao OficinaÁgil.",
      });

      if (!data.user) {
        console.error("Login bem-sucedido, mas dados de usuário ausentes");
        setIsLoading(false);
        return;
      }

      // Verificar se é admin
      try {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', values.email)
          .single();

        if (adminData) {
          console.log("Usuário é admin, redirecionando para dashboard admin");
          setIsLoading(false);
          navigate("/admin/dashboard");
          return;
        }
        
        // Para usuários normais, obter o próximo passo e redirecionar
        const userId = data.user?.id;
        if (userId) {
          setUserId(userId);
          const nextStep = await getNextOnboardingStep(userId);
          console.log("Próximo passo do onboarding:", nextStep);
          setIsLoading(false);
          navigate(nextStep);
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

  return { isLoading, userId, handleLogin, setUserId };
};

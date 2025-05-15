
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { LoginFormValues } from '@/components/auth/LoginForm';

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
        return;
      }

      console.log("Login bem-sucedido, verificando tipo de usuário");
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao OficinaÁgil.",
      });

      // Verificar se é admin
      try {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', values.email)
          .single();

        if (adminData) {
          console.log("Usuário é admin, redirecionando para dashboard admin");
          navigate("/admin/dashboard");
        } else {
          console.log("Usuário normal, armazenando ID e deixando o efeito redirecionar");
          setUserId(data.user?.id || null);
        }
      } catch (adminCheckError) {
        console.error("Erro ao verificar tipo de usuário:", adminCheckError);
        // Se falhar a verificação, direciona para dashboard comum
        setUserId(data.user?.id || null);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login. Verifique sua conexão.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, userId, handleLogin, setUserId };
};

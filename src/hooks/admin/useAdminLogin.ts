
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { FormValues } from './types';

export const useAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleLogin = async (values: FormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Iniciando login admin com:", values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          setErrorMessage(error.message || 'Erro desconhecido durante o login');
        }
        
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message || "Ocorreu um erro durante o login",
        });
        return;
      }

      if (!data.session || !data.user) {
        setErrorMessage("Sessão de login inválida.");
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Não foi possível iniciar sua sessão",
        });
        return;
      }

      console.log("Login bem-sucedido, verificando se é admin");
      
      // Verifica se o usuário é um administrador
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', values.email)
        .limit(1);

      if (adminError) {
        console.error("Erro ao verificar admin:", adminError);
        await supabase.auth.signOut();
        
        toast({
          variant: "destructive",
          title: "Erro ao verificar permissões",
          description: "Ocorreu um erro ao verificar suas permissões de administrador.",
        });
        
        setErrorMessage("Erro ao verificar permissões de administrador.");
        setIsLoading(false);
        return;
      }

      // Modificado para verificar se há algum resultado no array
      if (!adminData || adminData.length === 0) {
        console.error("Usuário não é administrador");
        await supabase.auth.signOut();
        
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        
        setErrorMessage("Este usuário não tem permissão de administrador.");
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel de administração.",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      setErrorMessage('Ocorreu um erro durante o login. ' + (error.message || ''));
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMessage,
    handleLogin,
  };
};

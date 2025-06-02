
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, testSupabaseConnection } from "@/lib/supabase";
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
      // Verificar a conexão com o Supabase antes de tentar o login
      console.log("Verificando conexão antes do login admin...");
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        console.error("Não foi possível conectar ao Supabase para login admin");
        setErrorMessage("Não foi possível conectar ao servidor de autenticação. Verifique sua conexão.");
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor de autenticação. Conecte o Supabase para continuar.",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Iniciando login admin com:", values.email);
      
      // Tentar login com supabase.auth.signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Credenciais inválidas. Verifique seu email e senha.');
          toast({
            variant: "destructive",
            title: "Credenciais inválidas",
            description: "Verifique seu email e senha.",
          });
        } else {
          setErrorMessage(error.message || 'Erro desconhecido durante o login');
          toast({
            variant: "destructive",
            title: "Erro ao fazer login",
            description: error.message || "Ocorreu um erro durante o login",
          });
        }
        setIsLoading(false);
        return;
      }

      // Verifica se a sessão foi criada corretamente
      if (!data.session || !data.user) {
        setErrorMessage("Sessão de login inválida.");
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Não foi possível iniciar sua sessão",
        });
        setIsLoading(false);
        return;
      }

      console.log("Login bem-sucedido, verificando se é admin através da tabela profiles");
      
      // Verificar se o usuário é um administrador através da role na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Erro ao verificar role do usuário:", profileError);
        setErrorMessage('Erro ao verificar permissões: ' + profileError.message);
        
        await supabase.auth.signOut();
        
        toast({
          variant: "destructive",
          title: "Erro ao verificar permissões",
          description: "Ocorreu um erro ao verificar suas permissões.",
        });
        
        setIsLoading(false);
        return;
      }

      if (!profileData || (profileData.role !== 'admin' && profileData.role !== 'superadmin')) {
        console.error("Usuário não é administrador, role:", profileData?.role);
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

      console.log("Redirecionando para dashboard admin");
      setIsLoading(false);
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      setErrorMessage('Ocorreu um erro durante o login. ' + (error.message || ''));
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login.",
      });
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMessage,
    handleLogin,
  };
};

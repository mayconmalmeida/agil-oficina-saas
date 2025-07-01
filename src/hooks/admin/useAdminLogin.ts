
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
      console.log("🔍 Verificando conexão antes do login admin...");
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        console.error("❌ Não foi possível conectar ao Supabase para login admin");
        setErrorMessage("Não foi possível conectar ao servidor de autenticação. Verifique sua conexão.");
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor de autenticação. Conecte o Supabase para continuar.",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("✅ Conexão estabelecida, tentando login admin com email:", values.email);
      
      // Verificar primeiro se o usuário existe na tabela profiles como admin
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('email', values.email)
        .maybeSingle();

      if (profileCheckError) {
        console.error("❌ Erro ao verificar perfil do admin:", profileCheckError);
        setErrorMessage('Erro ao verificar perfil de administrador: ' + profileCheckError.message);
        toast({
          variant: "destructive",
          title: "Erro ao verificar perfil",
          description: "Não foi possível verificar se o usuário é administrador.",
        });
        setIsLoading(false);
        return;
      }

      if (!existingProfile) {
        console.error("❌ Usuário não encontrado na tabela profiles:", values.email);
        setErrorMessage("Usuário não encontrado. Verifique o email digitado.");
        toast({
          variant: "destructive",
          title: "Usuário não encontrado",
          description: "Este email não está cadastrado no sistema.",
        });
        setIsLoading(false);
        return;
      }

      if (existingProfile.role !== 'admin' && existingProfile.role !== 'superadmin') {
        console.error("❌ Usuário não tem permissão de admin. Role atual:", existingProfile.role);
        setErrorMessage("Este usuário não tem permissão de administrador.");
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ Perfil de admin encontrado, tentando autenticação...");
      
      // Tentar login com supabase.auth.signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("❌ Erro de autenticação:", error);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Credenciais inválidas. Verifique seu email e senha.');
          toast({
            variant: "destructive",
            title: "Credenciais inválidas",
            description: "Verifique seu email e senha. Lembre-se que administradores devem ser criados via auth do Supabase.",
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

      console.log("✅ Login de admin bem-sucedido!");

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel de administração.",
      });

      console.log("➡️ Redirecionando para dashboard admin");
      setIsLoading(false);
      navigate("/admin");
    } catch (error: any) {
      console.error("💥 Erro inesperado:", error);
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

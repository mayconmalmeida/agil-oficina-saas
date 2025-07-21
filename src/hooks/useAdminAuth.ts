
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { testSupabaseConnection, supabase } from '@/lib/supabase';
import type { FormValues } from './admin/types';
import { UseFormReturn } from 'react-hook-form';

export type { FormValues } from './admin/types';

export const useAdminAuth = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      console.log("🔍 Verificando conexão com Supabase...");
      
      const connected = await testSupabaseConnection();
      
      if (connected) {
        console.log("✅ Conexão estabelecida");
        setConnectionStatus('connected');
        setErrorMessage(null);
      } else {
        console.log("❌ Falha na conexão");
        setConnectionStatus('error');
        setErrorMessage('Não foi possível conectar ao servidor');
      }
      return connected;
    } catch (error) {
      console.error("💥 Erro ao verificar conexão:", error);
      setConnectionStatus('error');
      setErrorMessage('Ocorreu um erro ao verificar a conexão.');
      return false;
    }
  }, []);

  const handleLogin = async (values: { email: string; password: string }) => {
    if (connectionStatus !== 'connected') {
      setErrorMessage("Não é possível fazer login sem conexão com o servidor");
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("🔐 Tentando fazer login admin...");
      
      // Fazer login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (loginError) {
        throw new Error(loginError.message);
      }

      if (!data.user) {
        throw new Error("Dados do usuário não encontrados");
      }

      console.log("✅ Login realizado, verificando permissões admin...");

      // Verificar se é admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Erro ao buscar perfil:", profileError);
        throw new Error("Erro ao verificar permissões");
      }

      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
      
      if (!isAdmin) {
        console.log("❌ Usuário não é admin, role:", profile.role);
        await supabase.auth.signOut();
        throw new Error("Acesso negado: usuário não é administrador");
      }

      console.log("✅ Admin autenticado com sucesso:", profile.email);
      
      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${profile.email}`,
      });

      return true;

    } catch (err: any) {
      console.error("💥 Erro no login admin:", err);
      const message = err.message || "Erro ao fazer login";
      setErrorMessage(message);
      
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: message,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro desativada - admins são criados via role na tabela profiles
  const registerAdmin = async (form: UseFormReturn<FormValues>) => {
    toast({
      variant: "destructive",
      title: "Acesso negado",
      description: "O cadastro de administradores deve ser feito através da atribuição de role na tabela profiles.",
    });
    return;
  };

  return {
    isLoading,
    connectionStatus,
    errorMessage,
    isRegistering: false,
    checkConnection,
    handleLogin,
    registerAdmin
  };
};

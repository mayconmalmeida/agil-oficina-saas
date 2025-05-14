
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import { z } from 'zod';
import { formSchema } from '@/components/admin/auth/LoginForm';

export type FormValues = z.infer<typeof formSchema>;

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const checkConnection = async () => {
    try {
      console.log("Verificando conexão com Supabase...");
      const isConnected = await testSupabaseConnection();
      
      if (isConnected) {
        console.log("Conexão Supabase bem-sucedida");
        setConnectionStatus('connected');
        
        // Verificar se já existe uma sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Sessão existente encontrada", session);
          return checkAdminStatus(session);
        }
      } else {
        setConnectionStatus('error');
        setErrorMessage('Não foi possível conectar ao serviço de autenticação.');
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar conexão com Supabase:", error);
      setConnectionStatus('error');
      setErrorMessage('Falha ao verificar a conexão com o serviço de autenticação.');
      return false;
    }
  };
  
  const checkAdminStatus = async (session: any) => {
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();
        
      if (adminData) {
        toast({
          title: "Já autenticado",
          description: "Redirecionando para o painel administrativo.",
        });
        navigate("/admin/dashboard");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar status de admin:", error);
      return false;
    }
  };

  const handleLogin = async (values: FormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Iniciando login admin com:", values.email);
      
      // Verificar novamente a conexão antes de tentar login
      if (connectionStatus === 'error') {
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
        }
      }
      
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

      console.log("Login bem-sucedido, verificando se é admin");
      
      // Verifica se o usuário é um administrador
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', values.email)
        .single();

      if (adminError || !adminData) {
        console.error("Erro ao verificar admin:", adminError);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
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

  const registerAdmin = async (form: UseFormReturn<FormValues>) => {
    setIsRegistering(true);
    setErrorMessage(null);
    
    try {
      // Cadastrar o usuário admin
      const adminEmail = "mayconintermediacao@gmail.com";
      const adminPassword = "Admin@123";
      
      // Primeiro, criar o usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Não foi possível criar o usuário admin.");
      }
      
      // Adicionar o usuário à tabela de admins
      const { error: adminError } = await supabase
        .from('admins')
        .insert([
          { 
            id: authData.user.id,
            email: adminEmail,
            name: 'Administrador Sistema',
            role: 'super_admin',
            created_at: new Date().toISOString()
          }
        ]);
        
      if (adminError) {
        throw adminError;
      }
      
      toast({
        title: "Administrador criado",
        description: "O usuário administrador foi cadastrado com sucesso.",
      });
      
      // Preencher os campos do formulário com as credenciais do admin
      form.setValue('email', adminEmail);
      form.setValue('password', adminPassword);
      
    } catch (error: any) {
      console.error("Erro ao cadastrar admin:", error);
      
      if (error.message.includes('already registered')) {
        setErrorMessage('Este email já está registrado. Tente fazer login.');
        toast({
          variant: "default",
          title: "Usuário já existe",
          description: "Este email já está registrado. Tente fazer login.",
        });
        
        // Preencher o email no formulário de login
        form.setValue('email', "mayconintermediacao@gmail.com");
      } else {
        setErrorMessage('Erro ao cadastrar administrador: ' + (error.message || ''));
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível cadastrar o administrador.",
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    isLoading,
    connectionStatus,
    errorMessage,
    isRegistering,
    checkConnection,
    handleLogin,
    registerAdmin
  };
};

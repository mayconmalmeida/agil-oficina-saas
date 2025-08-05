
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
      console.log("🔐 Tentando login admin com email:", values.email);
      
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
        return;
      }

      // Verificar se a sessão foi criada corretamente
      if (!data.session || !data.user) {
        setErrorMessage("Sessão de login inválida.");
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Não foi possível iniciar sua sessão",
        });
        return;
      }

      console.log("✅ Login bem-sucedido para userId:", data.user.id);

      // Verificar se é admin através da tabela profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Erro ao verificar perfil:", profileError);
        setErrorMessage('Erro ao verificar permissões de administrador.');
        toast({
          variant: "destructive",
          title: "Erro ao verificar permissões",
          description: "Não foi possível verificar se o usuário é administrador.",
        });
        await supabase.auth.signOut();
        return;
      }

      if (!profile) {
        console.error("❌ Perfil não encontrado para userId:", data.user.id);
        setErrorMessage("Perfil de usuário não encontrado.");
        toast({
          variant: "destructive",
          title: "Perfil não encontrado",
          description: "Este usuário não tem um perfil válido no sistema.",
        });
        await supabase.auth.signOut();
        return;
      }

      const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
      
      if (!isAdmin) {
        console.error("❌ Usuário não tem permissão de admin. Role:", profile.role);
        setErrorMessage("Este usuário não tem permissão de administrador.");
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        await supabase.auth.signOut();
        return;
      }

      console.log("✅ Admin autenticado com sucesso:", profile.email, "role:", profile.role);

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo ao painel administrativo, ${profile.email}`,
      });

      console.log("➡️ Redirecionando para dashboard admin");
      navigate("/admin");
    } catch (error: any) {
      console.error("💥 Erro inesperado:", error);
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

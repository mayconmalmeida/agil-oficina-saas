
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

      // ✅ BUSCAR ADMIN NA TABELA ADMINS EM VEZ DE PROFILES
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, email, is_superadmin')
        .eq('email', values.email)
        .maybeSingle();

      if (adminError) {
        console.error("❌ Erro ao verificar admin:", adminError);
        setErrorMessage('Erro ao verificar permissões de administrador.');
        toast({
          variant: "destructive",
          title: "Erro ao verificar permissões",
          description: "Não foi possível verificar se o usuário é administrador.",
        });
        await supabase.auth.signOut();
        return;
      }

      if (!admin) {
        console.error("❌ Admin não encontrado na tabela admins para email:", values.email);
        setErrorMessage("Este usuário não é um administrador autorizado.");
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        await supabase.auth.signOut();
        return;
      }

      console.log("✅ Admin encontrado na tabela admins:", admin.email, "is_superadmin:", admin.is_superadmin);

      // ✅ AGORA CRIAR/ATUALIZAR PERFIL ADMIN NA TABELA PROFILES COM ROLE ADMIN
      const adminRole = admin.is_superadmin ? 'superadmin' : 'admin';
      
      console.log("🔧 Criando/atualizando perfil admin na tabela profiles...");
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: admin.email,
          role: adminRole,
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.warn("⚠️ Erro ao criar/atualizar perfil admin:", profileError);
        // Não bloquear o login por isso, apenas avisar
      } else {
        console.log("✅ Perfil admin criado/atualizado com sucesso");
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo ao painel administrativo, ${admin.email}`,
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

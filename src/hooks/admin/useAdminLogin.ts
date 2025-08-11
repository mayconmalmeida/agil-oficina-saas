
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
      console.log("🔐 Tentando login admin direto na tabela admins:", values.email);
      
      // ✅ PRIMEIRO: Verificar se admin existe na tabela admins
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, email, password, is_superadmin')
        .eq('email', values.email)
        .maybeSingle();

      if (adminError) {
        console.error("❌ Erro ao buscar admin na tabela admins:", adminError);
        setErrorMessage("Erro ao verificar credenciais. Tente novamente.");
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Erro ao verificar credenciais. Tente novamente.",
        });
        return;
      }

      if (!admin) {
        console.error("❌ Admin não encontrado na tabela admins para email:", values.email);
        setErrorMessage("Email não encontrado no sistema de administração.");
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Email não encontrado no sistema de administração.",
        });
        return;
      }

      console.log("✅ Admin encontrado na tabela admins:", {
        email: admin.email,
        id: admin.id,
        is_superadmin: admin.is_superadmin
      });

      // ✅ VERIFICAR SENHA DIRETAMENTE
      let passwordValid = false;
      
      // Se a senha começa com $2a$, $2b$, $2x$, $2y$ é um hash bcrypt
      const isBcryptHash = /^\$2[abxy]\$/.test(admin.password);
      
      if (isBcryptHash) {
        try {
          // Importar bcrypt dinamicamente
          const bcrypt = await import('bcryptjs');
          passwordValid = await bcrypt.compare(values.password, admin.password);
          console.log("✅ Verificação de senha hash bcrypt:", passwordValid);
        } catch (bcryptError) {
          console.error("❌ Erro ao verificar hash bcrypt:", bcryptError);
          passwordValid = false;
        }
      } else {
        // Comparação direta para senhas em texto simples
        passwordValid = values.password === admin.password;
        console.log("✅ Verificação de senha direta:", passwordValid, {
          providedPassword: values.password,
          storedPassword: admin.password,
          match: passwordValid
        });
      }

      if (!passwordValid) {
        console.error("❌ Senha incorreta para admin:", admin.email);
        setErrorMessage("Senha incorreta. Verifique suas credenciais.");
        toast({
          variant: "destructive",
          title: "Credenciais inválidas",
          description: "Senha incorreta. Verifique suas credenciais.",
        });
        return;
      }

      console.log("✅ Senha validada com sucesso para admin:", admin.email);

      // ✅ CRIAR SESSÃO FAKE PARA ADMIN
      const userId = admin.id;
      console.log("✅ Usando ID do admin da tabela admins:", userId);

      // Tentar autenticação no Supabase Auth (opcional, pode falhar)
      let supabaseUserId = userId;
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (!authError && authData.session) {
          console.log("✅ Bonus: Autenticação Supabase também bem-sucedida");
          supabaseUserId = authData.user.id;
        } else {
          console.log("⚠️ Autenticação Supabase falhou, usando ID da tabela admins");
        }
      } catch (authAttemptError) {
        console.log("⚠️ Erro na tentativa de autenticação Supabase, usando tabela admins");
      }

      // ✅ CRIAR/ATUALIZAR PERFIL ADMIN NA TABELA PROFILES
      const adminRole = admin.is_superadmin ? 'superadmin' : 'admin';
      
      console.log("🔧 Criando/atualizando perfil admin na tabela profiles...");
      
      // Usar o userId do Supabase Auth se disponível, senão o da tabela admins
      const profileId = supabaseUserId;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: profileId,
          email: admin.email,
          role: adminRole,
          is_active: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("❌ Erro ao criar/atualizar perfil admin:", profileError);
        // Se falhar ao criar perfil, ainda assim permitir login
        console.log("⚠️ Continuando com login mesmo com erro de perfil");
      } else {
        console.log("✅ Perfil admin criado/atualizado com sucesso");
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo ao painel administrativo, ${admin.email}`,
      });

      console.log("➡️ Redirecionando para dashboard admin");
      
      // Esperar um pouco para garantir que o perfil foi criado antes de redirecionar
      setTimeout(() => {
        navigate("/admin");
      }, 100);
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


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

      if (adminError || !admin) {
        console.error("❌ Admin não encontrado na tabela admins:", adminError);
        setErrorMessage("Credenciais inválidas ou usuário não é administrador.");
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        return;
      }

      console.log("✅ Admin encontrado na tabela admins:", admin.email);

      // ✅ VERIFICAR SENHA DIRETAMENTE
      // Verificar se a senha está hasheada (bcrypt) ou é texto simples
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
        console.log("✅ Verificação de senha direta:", passwordValid);
      }

      if (!passwordValid) {
        console.error("❌ Senha incorreta para admin:", admin.email);
        setErrorMessage("Credenciais inválidas. Verifique seu email e senha.");
        toast({
          variant: "destructive",
          title: "Credenciais inválidas",
          description: "Verifique seu email e senha.",
        });
        return;
      }

      console.log("✅ Senha validada com sucesso para admin:", admin.email);

      // ✅ TERCEIRO: Criar sessão direta usando os dados da tabela admins
      // Como estamos autenticando diretamente na tabela admins, vamos usar o ID do admin
      const userId = admin.id;
      console.log("✅ Usando ID do admin da tabela admins:", userId);

      // Opcional: Tentar também autenticar no Supabase Auth se o usuário existir lá
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (!authError && authData.session) {
          console.log("✅ Bonus: Autenticação Supabase também bem-sucedida");
          // Usar o ID do Supabase Auth se disponível
          // userId = authData.user.id;
        } else {
          console.log("⚠️ Autenticação Supabase falhou, mas continuando com dados da tabela admins");
        }
      } catch (authAttemptError) {
        console.log("⚠️ Erro na tentativa de autenticação Supabase, continuando com tabela admins");
      }

      // ✅ CRIAR/ATUALIZAR PERFIL ADMIN NA TABELA PROFILES
      const adminRole = admin.is_superadmin ? 'superadmin' : 'admin';
      
      console.log("🔧 Criando/atualizando perfil admin na tabela profiles...");
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: admin.email,
          role: adminRole,
          is_active: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
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

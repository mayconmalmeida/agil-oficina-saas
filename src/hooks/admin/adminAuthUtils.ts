
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Checks if the user has admin permissions
 */
export const checkAdminStatus = async (session: any) => {
  try {
    if (!session || !session.user || !session.user.email) {
      console.error("Sessão inválida ou sem email");
      return false;
    }

    console.log("Verificando status admin para:", session.user.email);
    
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('email, nivel')
      .eq('email', session.user.email)
      .limit(1);
    
    if (adminError) {
      console.error("Erro ao verificar status de admin:", adminError);
      return false;
    }
      
    if (adminData && adminData.length > 0) {
      console.log("Usuário é administrador:", session.user.email);
      toast({
        title: "Já autenticado",
        description: "Redirecionando para o painel administrativo.",
      });
      return true;
    }
    
    console.log("Usuário não é administrador:", session.user.email);
    return false;
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return false;
  }
};

/**
 * Creates a new admin user in the system
 */
export const createAdminUser = async (email: string, password: string, nivel: string = 'operacional') => {
  // Primeiro, criar o usuário na autenticação
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        is_admin: true,
        nivel: nivel
      }
    }
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
        email: email,
        nivel: nivel
      }
    ]);
    
  if (adminError) {
    throw adminError;
  }

  return authData.user;
};

/**
 * Função para definir um usuário existente como administrador
 */
export const setUserAsAdmin = async (email: string, nivel: string = 'operacional') => {
  try {
    // Verificar se o usuário já existe na tabela de administradores
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email);
      
    if (existingAdmin && existingAdmin.length > 0) {
      return { success: true, message: 'Usuário já é um administrador.' };
    }
    
    // Adicionar o usuário à tabela de administradores
    const { error } = await supabase
      .from('admins')
      .insert([{ email, nivel }]);
      
    if (error) {
      return { success: false, message: 'Erro ao definir usuário como administrador: ' + error.message };
    }
    
    return { success: true, message: 'Usuário definido como administrador com sucesso.' };
  } catch (error: any) {
    console.error('Erro ao definir admin:', error);
    return { success: false, message: error.message || 'Erro ao definir usuário como administrador.' };
  }
};

/**
 * Atualiza o nível de permissão de um administrador
 */
export const updateAdminPermission = async (email: string, nivel: string) => {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ nivel })
      .eq('email', email);
      
    if (error) {
      return { success: false, message: 'Erro ao atualizar permissões: ' + error.message };
    }
    
    return { success: true, message: 'Permissões atualizadas com sucesso.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Erro ao atualizar permissões.' };
  }
};

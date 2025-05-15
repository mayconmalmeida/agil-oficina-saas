
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Checks if the user has admin permissions
 */
export const checkAdminStatus = async (session: any) => {
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
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return false;
  }
};

/**
 * Creates a new admin user in the system
 */
export const createAdminUser = async (email: string, password: string) => {
  // Primeiro, criar o usuário na autenticação
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
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
export const setUserAsAdmin = async (email: string) => {
  try {
    // Verificar se o usuário já existe na tabela de administradores
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
      
    if (existingAdmin) {
      return { success: true, message: 'Usuário já é um administrador.' };
    }
    
    // Adicionar o usuário à tabela de administradores
    const { error } = await supabase
      .from('admins')
      .insert([{ email }]);
      
    if (error) {
      return { success: false, message: 'Erro ao definir usuário como administrador: ' + error.message };
    }
    
    return { success: true, message: 'Usuário definido como administrador com sucesso.' };
  } catch (error: any) {
    console.error('Erro ao definir admin:', error);
    return { success: false, message: error.message || 'Erro ao definir usuário como administrador.' };
  }
};


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
        id: authData.user.id,
        email: email,
        name: 'Administrador Sistema',
        role: 'super_admin',
        created_at: new Date().toISOString()
      }
    ]);
    
  if (adminError) {
    throw adminError;
  }

  return authData.user;
};

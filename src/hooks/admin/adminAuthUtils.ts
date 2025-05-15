
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
    
    // Try to get admin status directly without RLS policies
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
  try {
    console.log(`Tentando criar admin com email: ${email}, nível: ${nivel}`);
    
    // First check if admin already exists in admins table
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .single();
      
    if (!adminCheckError && existingAdmin) {
      console.log("Admin já existe na tabela de admins");
      
      // Try to sign in to see if auth user exists
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.log("Usuário auth não existe ou senha incorreta, criando novo usuário auth");
        // Create auth user if it doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              is_admin: true,
              nivel: nivel
            }
          }
        });
        
        if (signUpError) {
          console.error("Erro ao criar usuário auth:", signUpError);
          throw signUpError;
        }
        
        console.log("Usuário auth criado com sucesso para admin existente");
      } else {
        console.log("Usuário auth já existe e login bem-sucedido");
      }
      
      // Admin already exists, update nivel if needed
      if (existingAdmin.email === email) {
        console.log(`Admin ${email} já existe, atualizando nivel para ${nivel}`);
        const { error: updateError } = await supabase
          .from('admins')
          .update({ nivel })
          .eq('email', email);
          
        if (updateError) {
          console.error("Erro ao atualizar nivel do admin:", updateError);
          throw updateError;
        }
      }
      
      return { email, nivel };
    }
    
    // Create auth user first
    console.log("Verificando se usuário auth já existe...");
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    let userId = existingUser?.user?.id;
    
    // If user doesn't exist, create it
    if (checkError || !userId) {
      console.log("Usuário auth não existe, criando novo usuário...");
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
        console.error("Erro ao criar usuário auth:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Não foi possível criar o usuário admin.");
      }
      
      userId = authData.user.id;
      console.log("Usuário auth criado com sucesso:", userId);
    } else {
      console.log("Usuário auth já existe:", userId);
    }
    
    // Now insert into admins table
    console.log("Adicionando à tabela de admins...");
    const { error: adminError } = await supabase
      .from('admins')
      .insert([{ 
        email: email,
        nivel: nivel
      }]);
      
    if (adminError) {
      console.error("Erro ao adicionar admin:", adminError);
      throw adminError;
    }

    console.log("Admin criado com sucesso!");
    return { id: userId, email, nivel };
  } catch (error) {
    console.error("Erro completo ao criar admin:", error);
    throw error;
  }
};

/**
 * Função para definir um usuário existente como administrador
 */
export const setUserAsAdmin = async (email: string, nivel: string = 'operacional') => {
  try {
    console.log(`Tentando definir ${email} como admin com nível ${nivel}`);
    
    // Verificar se o usuário já existe na tabela de administradores
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email);
      
    if (existingAdmin && existingAdmin.length > 0) {
      console.log("Usuário já é admin");
      return { success: true, message: 'Usuário já é um administrador.' };
    }
    
    // Adicionar o usuário à tabela de administradores usando upsert para evitar duplicação
    console.log("Adicionando usuário como admin");
    const { error } = await supabase
      .from('admins')
      .upsert([{ email, nivel }]);
      
    if (error) {
      console.error("Erro ao definir como admin:", error);
      return { success: false, message: 'Erro ao definir usuário como administrador: ' + error.message };
    }
    
    console.log("Usuário definido como admin com sucesso");
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

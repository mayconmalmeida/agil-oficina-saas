
import { supabase } from "@/lib/supabase";

/**
 * ✅ SECURE FUNCTION: Verifica se o usuário tem permissões de admin através da tabela profiles
 */
export const checkAdminStatus = async (session: any) => {
  try {
    if (!session || !session.user || !session.user.email) {
      console.error("Sessão inválida ou sem email do usuário");
      return false;
    }

    console.log("Verificando status admin para email:", session.user.email);
    
    // ✅ Usar RPC function segura para verificar admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_user_admin', {
      user_email: session.user.email
    });
    
    if (adminError) {
      console.error("Erro ao verificar admin:", adminError);
      return false;
    }
      
    if (isAdmin) {
      console.log("Usuário é administrador:", session.user.email);
      
      // ✅ Buscar role específica do admin
      const { data: role, error: roleError } = await supabase.rpc('get_admin_role', {
        user_email: session.user.email
      });
      
      if (roleError) {
        console.warn("Erro ao buscar role admin:", roleError);
      } else {
        console.log("Role do admin:", role);
      }
      
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
 * ✅ SECURE FUNCTION: Função para verificar se o usuário é super admin através da tabela profiles
 */
export const checkSuperAdminStatus = async (userEmail: string) => {
  try {
    const { data: role, error: roleError } = await supabase.rpc('get_admin_role', {
      user_email: userEmail
    });
    
    if (roleError) {
      console.error("Erro ao verificar super admin:", roleError);
      return false;
    }
      
    return role === 'superadmin';
  } catch (error) {
    console.error("Erro ao verificar status de super admin:", error);
    return false;
  }
};

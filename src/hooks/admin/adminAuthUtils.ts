
import { supabase } from "@/lib/supabase";

/**
 * Verifica se o usuário tem permissões de admin através da role na tabela profiles
 */
export const checkAdminStatus = async (session: any) => {
  try {
    if (!session || !session.user || !session.user.id) {
      console.error("Sessão inválida ou sem ID do usuário");
      return false;
    }

    console.log("Verificando status admin para usuário:", session.user.id);
    
    // Buscar a role do usuário na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Erro ao verificar role do usuário:", profileError);
      return false;
    }
      
    if (profileData && (profileData.role === 'admin' || profileData.role === 'superadmin')) {
      console.log("Usuário é administrador:", session.user.email, "role:", profileData.role);
      return true;
    }
    
    console.log("Usuário não é administrador:", session.user.email, "role:", profileData?.role);
    return false;
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return false;
  }
};

/**
 * Função para verificar se o usuário é super admin
 */
export const checkSuperAdminStatus = async (userId: string) => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Erro ao verificar role do usuário:", profileError);
      return false;
    }
      
    return profileData?.role === 'superadmin';
  } catch (error) {
    console.error("Erro ao verificar status de super admin:", error);
    return false;
  }
};

/**
 * Função para promover um usuário a admin (apenas super admins podem fazer isso)
 */
export const promoteToAdmin = async (userId: string, requesterUserId: string) => {
  try {
    // Verificar se o solicitante é super admin
    const isSuperAdmin = await checkSuperAdminStatus(requesterUserId);
    if (!isSuperAdmin) {
      throw new Error("Apenas super administradores podem promover usuários a admin");
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao promover usuário a admin:", error);
    return { success: false, error: error.message };
  }
};

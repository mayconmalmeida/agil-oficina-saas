
import { supabase } from "@/lib/supabase";

/**
 * ✅ NOVA FUNÇÃO: Verifica se o usuário tem permissões de admin através da tabela admins
 */
export const checkAdminStatus = async (session: any) => {
  try {
    if (!session || !session.user || !session.user.email) {
      console.error("Sessão inválida ou sem email do usuário");
      return false;
    }

    console.log("Verificando status admin para email:", session.user.email);
    
    // ✅ Buscar na tabela admins pelo email
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('email, is_superadmin')
      .eq('email', session.user.email)
      .maybeSingle();
    
    if (adminError) {
      console.error("Erro ao verificar admin na tabela admins:", adminError);
      return false;
    }
      
    if (adminData) {
      console.log("Usuário é administrador:", session.user.email, "is_superadmin:", adminData.is_superadmin);
      
      // ✅ Criar/atualizar perfil na tabela profiles para compatibilidade
      const adminRole = adminData.is_superadmin ? 'superadmin' : 'admin';
      
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: adminData.email,
            role: adminRole,
            is_active: true,
            created_at: new Date().toISOString()
          });
        
        console.log("Perfil admin sincronizado com sucesso");
      } catch (syncError) {
        console.warn("Erro ao sincronizar perfil admin:", syncError);
        // Não bloquear o login por isso
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
 * ✅ NOVA FUNÇÃO: Função para verificar se o usuário é super admin através da tabela admins
 */
export const checkSuperAdminStatus = async (userEmail: string) => {
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('is_superadmin')
      .eq('email', userEmail)
      .maybeSingle();
    
    if (adminError) {
      console.error("Erro ao verificar super admin:", adminError);
      return false;
    }
      
    return adminData?.is_superadmin === true;
  } catch (error) {
    console.error("Erro ao verificar status de super admin:", error);
    return false;
  }
};

/**
 * Função para promover um usuário a admin (apenas super admins podem fazer isso)
 */
export const promoteToAdmin = async (userEmail: string, requesterEmail: string) => {
  try {
    // Verificar se o solicitante é super admin
    const isSuperAdmin = await checkSuperAdminStatus(requesterEmail);
    if (!isSuperAdmin) {
      throw new Error("Apenas super administradores podem promover usuários a admin");
    }

    // Verificar se o usuário já existe na tabela admins
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    if (existingAdmin) {
      throw new Error("Usuário já é administrador");
    }

    // Adicionar à tabela admins
    const { error } = await supabase
      .from('admins')
      .insert({
        email: userEmail,
        is_superadmin: false
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao promover usuário a admin:", error);
    return { success: false, error: error.message };
  }
};

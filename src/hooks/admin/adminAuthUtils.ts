
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
 * NOTA: As funções createAdminUser, setUserAsAdmin e updateAdminPermission
 * foram removidas porque agora gerenciamos roles apenas através da tabela profiles.
 * Para criar um admin, use a função RPC set_user_role diretamente no Supabase
 * ou através do SQL Editor.
 * 
 * Exemplo de como definir um usuário como admin:
 * UPDATE profiles SET role = 'admin' WHERE email = 'usuario@email.com';
 */

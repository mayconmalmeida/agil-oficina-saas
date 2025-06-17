
import { supabase } from "../lib/supabase";

// SEGURANÇA: Esta função foi refatorada para usar apenas a tabela profiles
// A tabela admins foi removida por questões de segurança (senhas em texto plano)

const setAdminRole = async (email: string) => {
  try {
    console.log("Tentando definir role de admin para:", email);
    
    // Verificar se o usuário existe na tabela profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
      
    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      return { success: false, error: "Usuário não encontrado na tabela profiles" };
    }
    
    if (!existingProfile) {
      console.log("Perfil não encontrado para o email:", email);
      return { success: false, error: "Perfil não encontrado" };
    }
    
    // Atualizar a role para admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', email);
      
    if (updateError) {
      console.error("Erro ao atualizar role:", updateError);
      return { success: false, error: updateError.message };
    }
    
    console.log("Role de administrador definida com sucesso para:", email);
    return { success: true };
  } catch (error) {
    console.error("Erro ao configurar administrador:", error);
    return { success: false, error: error.message };
  }
};

// Este código é executado diretamente no browser console
(async () => {
  const adminEmail = "mayconintermediacao@gmail.com";
  const result = await setAdminRole(adminEmail);
  console.log("Resultado da operação:", result);
})();

// Exportando a função para uso externo se necessário
export { setAdminRole };

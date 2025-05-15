
import { supabase } from "../lib/supabase";

// Set admin email function
const setAdminEmail = async (email: string) => {
  try {
    // Verificar se já existe na tabela admin
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();
      
    if (existingAdmin) {
      console.log("Este email já é um administrador:", email);
      return { success: true };
    }
    
    // Generate a temporary password - in a real application, you might want to
    // generate a more secure password or have the user set it
    const tempPassword = Math.random().toString(36).substring(2, 15);
    
    // Inserir na tabela admin with required password field
    const { error } = await supabase
      .from('admins')
      .insert([
        { 
          email: email,
          password: tempPassword, // Adding the required password field
          is_superadmin: true // Setting as superadmin by default
        }
      ]);
      
    if (error) {
      console.error("Erro ao definir admin:", error);
      return { success: false, error };
    }
    
    console.log("Administrador definido com sucesso:", email);
    return { success: true };
  } catch (error) {
    console.error("Erro ao configurar administrador:", error);
    return { success: false, error };
  }
};

// Este código é executado diretamente no browser console
(async () => {
  const adminEmail = "mayconintermediacao@gmail.com";
  const result = await setAdminEmail(adminEmail);
  console.log("Resultado da operação:", result);
})();

// Exportando a função para uso externo se necessário
export { setAdminEmail };

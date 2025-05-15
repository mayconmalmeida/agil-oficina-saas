
import { supabase } from "@/lib/supabase";
import { createAdminUser, setUserAsAdmin } from "@/hooks/admin/adminAuthUtils";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a predefined admin user with superadmin privileges
 */
export const createPredefinedAdmin = async () => {
  try {
    console.log("Iniciando criação do admin predefinido");
    const email = "mayconintermediacao@gmail.com";
    const password = "Oficina@123";
    const nivel = "superadmin";
    
    // Verificar se o usuário já existe
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log("Erro ao verificar se admin existe:", error.message);
      // Se o erro não for de credenciais inválidas, reportar o erro
      if (!error.message.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Erro ao verificar admin",
          description: error.message,
        });
        throw error;
      }
      
      // Usuário não existe, vamos criar
      console.log("Admin não existe, criando novo...");
      const result = await createAdminUser(email, password, nivel);
      
      toast({
        title: "Administrador criado com sucesso",
        description: `Usuário admin criado com email ${email}`,
      });
      
      return;
    }
    
    if (data.user) {
      console.log("Usuário já existe, verificando se é admin");
      // Se usuário já existe, verificamos se já está como admin
      const result = await setUserAsAdmin(email, nivel);
      
      if (result.success) {
        toast({
          title: "Administrador configurado",
          description: "O usuário já existe e foi configurado como administrador com sucesso.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao configurar admin",
          description: result.message,
        });
      }
      
      return;
    }
    
  } catch (error: any) {
    console.error("Erro ao criar admin:", error);
    toast({
      variant: "destructive",
      title: "Erro ao criar administrador",
      description: error.message || "Ocorreu um erro inesperado ao criar o administrador.",
    });
    throw error;
  }
};

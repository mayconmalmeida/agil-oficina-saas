
import { supabase } from "@/lib/supabase";
import { createAdminUser, setUserAsAdmin } from "@/hooks/admin/adminAuthUtils";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a predefined admin user with superadmin privileges
 */
export const createPredefinedAdmin = async () => {
  try {
    const email = "mayconintermediacao@gmail.com";
    const password = "Oficina@123";
    const nivel = "superadmin";
    
    // Verificar se o usuário já existe
    const { data: { user } } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (user) {
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
    
    // Se não existe, criamos novo usuário admin
    await createAdminUser(email, password, nivel);
    
    toast({
      title: "Administrador criado com sucesso",
      description: `Usuário admin criado com email ${email}`,
    });
    
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


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
    const isSuper = true;
    
    try {
      // Attempt to create the admin user
      console.log("Criando admin predefinido com", email);
      const result = await createAdminUser(email, password, isSuper);
      
      toast({
        title: "Administrador configurado com sucesso",
        description: `Usuário ${email} configurado como administrador. Você pode fazer login agora.`,
      });
      
      return result;
    } catch (error: any) {
      console.error("Erro ao criar admin predefinido:", error);
      
      // If the error is due to the user already existing, try to set as admin
      if (error.message?.includes('User already registered')) {
        console.log("Usuário já existe, tentando configurar como admin");
        const result = await setUserAsAdmin(email, isSuper);
        
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
        
        return { email, is_superadmin: isSuper };
      }
      
      // For other errors, show the error message
      toast({
        variant: "destructive",
        title: "Erro ao criar administrador",
        description: error.message || "Ocorreu um erro inesperado ao criar o administrador.",
      });
      throw error;
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

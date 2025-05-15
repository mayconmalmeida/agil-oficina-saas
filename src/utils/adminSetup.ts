
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { setUserAsAdmin } from '@/hooks/admin/adminAuthUtils';

/**
 * Creates an admin user with the specified email and password
 * For use only in initial setup or when adding new admin users
 */
export const setupAdminUser = async (email: string, password: string) => {
  try {
    console.log("Setting up admin user:", email);
    
    // First, create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/admin/login'
      }
    });
    
    if (authError) {
      console.error("Error creating admin user:", authError);
      return { 
        success: false, 
        message: `Failed to create admin user: ${authError.message}` 
      };
    }
    
    if (!authData.user) {
      console.error("No user returned after creation");
      return { 
        success: false, 
        message: "Failed to create admin user: No user data returned" 
      };
    }

    console.log("User created, now setting as admin");
    
    // Now, set this user as an admin
    const adminResult = await setUserAsAdmin(email);
    
    if (!adminResult.success) {
      console.error("Error setting user as admin:", adminResult.message);
      return { 
        success: false, 
        message: `User created but failed to set as admin: ${adminResult.message}` 
      };
    }
    
    console.log("Admin user setup completed successfully");
    return { 
      success: true, 
      message: "Admin user created successfully. They can now login to the admin panel.",
      user: authData.user 
    };
    
  } catch (error: any) {
    console.error("Unexpected error setting up admin:", error);
    return { 
      success: false, 
      message: `Unexpected error: ${error.message || 'Unknown error'}` 
    };
  }
};

/**
 * Helper function for the login page to create a predefined admin user
 */
export const createPredefinedAdmin = async () => {
  const email = 'mayconintermediacao@gmail.com';
  const password = 'Oficina@123';
  
  try {
    const result = await setupAdminUser(email, password);
    
    if (result.success) {
      toast({
        title: "Admin criado com sucesso",
        description: `O usuário ${email} foi configurado como administrador.`,
      });
      return true;
    } else {
      // Check if the error is because the user already exists
      if (result.message.includes('User already registered')) {
        // Try to just set the existing user as admin
        const adminResult = await setUserAsAdmin(email);
        
        if (adminResult.success) {
          toast({
            title: "Usuário configurado como admin",
            description: `O usuário ${email} já existia e foi configurado como administrador.`,
          });
          return true;
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao configurar admin",
            description: adminResult.message,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao criar admin",
          description: result.message,
        });
      }
      return false;
    }
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Erro inesperado",
      description: `Ocorreu um erro ao criar o admin: ${error.message || 'Erro desconhecido'}`,
    });
    return false;
  }
};

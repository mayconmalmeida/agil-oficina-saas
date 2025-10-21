
import { supabase, testSupabaseConnection } from "@/lib/supabase";

/**
 * Verifies the connection with Supabase and checks for existing session
 */
export const verifyConnection = async () => {
  try {
    console.log("Checking connection with Supabase...");
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      console.log("Supabase connection successful");
      
      // Check if a session already exists
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Existing session found", session);
        return { success: true, session };
      }
      
      return { success: true, session: null };
    } else {
      return { 
        success: false, 
        error: 'Could not connect to authentication service.'
      };
    }
  } catch (error: any) {
    console.error("Error checking connection with Supabase:", error);
    return { 
      success: false, 
      error: 'Failed to verify connection with authentication service.'
    };
  }
};

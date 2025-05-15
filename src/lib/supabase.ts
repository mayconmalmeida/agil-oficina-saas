
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { safeRpc } from '@/utils/supabaseTypes';

// Export the supabase client from our integration
export const supabase = supabaseClient;

/**
 * Tests the connection to Supabase and verifies authentication
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to get the current session to test connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      if (error.message.includes('Failed to fetch')) {
        console.error('Network connection error. Check your internet or environment variables.');
        return false;
      }
      return false;
    }
    
    console.log('Supabase connection successful:', data ? 'Data received' : 'No data');
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
};

/**
 * Verifies if the profiles table exists and has the necessary columns
 */
export const ensureProfilesTable = async () => {
  try {
    console.log('Checking if profiles table exists...');
    
    // Attempt to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking profiles table:', error.message);
      
      // Table might not exist
      if (error.message.includes('does not exist')) {
        console.log('Profiles table does not exist. Creating...');
        
        // Create the table via RPC function with security definer privileges
        const { error: rpcError } = await safeRpc('create_profile_table', {});
        
        if (rpcError) {
          console.error('Error creating profiles table via RPC:', rpcError);
          return false;
        }
        
        console.log('Profiles table created successfully via RPC');
        return true;
      }
      
      return false;
    }
    
    console.log('Profiles table exists and is accessible');
    return true;
  } catch (err) {
    console.error('Unexpected error checking profiles table:', err);
    return false;
  }
};

/**
 * Creates a profile for a user if it doesn't exist, respecting RLS policies
 */
export const createProfileIfNotExists = async (userId: string, email: string, fullName?: string) => {
  try {
    console.log('Checking if profile exists for user:', userId);
    
    // Check if profile exists
    const { data: existingProfile, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (queryError) {
      // If error is not found, create profile
      if (queryError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for:', email);
        
        // Try direct insert first - will work if RLS policies allow it
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId, 
            email: email, 
            full_name: fullName || '',
            is_active: true 
          })
          .select();
        
        if (insertError) {
          console.error('Error directly inserting profile:', insertError);
          
          // Try via RPC function as fallback (bypasses RLS)
          try {
            const { error: rpcError } = await safeRpc('create_profile', { 
              user_id: userId, 
              user_email: email, 
              user_full_name: fullName || '' 
            });
            
            if (rpcError) {
              console.error('Error creating profile via RPC:', rpcError);
              toast({
                variant: "destructive",
                title: "Erro de perfil",
                description: "Não foi possível criar seu perfil. Por favor, tente novamente mais tarde."
              });
              return { success: false, error: rpcError };
            }
            
            console.log('Profile created successfully via RPC');
            return { success: true, profile: { id: userId, email } };
          } catch (rpcCatchErr) {
            console.error('Error executing RPC to create profile:', rpcCatchErr);
            return { success: false, error: rpcCatchErr };
          }
        }
        
        console.log('Profile created successfully via direct insert');
        return { success: true, profile: insertData ? insertData[0] : { id: userId, email } };
      } else {
        console.error('Error checking existing profile:', queryError);
        return { success: false, error: queryError };
      }
    }
    
    console.log('Profile already exists for user');
    return { success: true, profile: existingProfile };
    
  } catch (err) {
    console.error('Unexpected error creating profile:', err);
    return { success: false, error: err };
  }
};

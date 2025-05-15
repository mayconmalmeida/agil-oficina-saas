
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Get environment variables with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log environment variable status for debugging (not exposing actual values)
console.log('Supabase environment variables status:', {
  VITE_SUPABASE_URL: supabaseUrl ? 'Defined' : 'Undefined',
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Defined' : 'Undefined',
});

// Create dummy client for development if environment variables are missing
const createDummyClient = () => {
  console.warn('⚠️ Creating dummy Supabase client. App will work in demo mode only.');
  
  // Return a mock client that doesn't throw errors but doesn't actually connect to Supabase
  return {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      limit: () => ({ data: [], error: null }),
    }),
    auth: {
      signInWithPassword: () => ({ data: { session: null, user: null }, error: null }),
      signOut: () => ({ error: null }),
      getSession: () => ({ data: { session: null }, error: null }),
    },
    rpc: () => ({ data: null, error: null }),
  };
};

// Create the Supabase client with proper error handling
export const supabase = (() => {
  try {
    // Only create a real client if we have the required URL
    if (supabaseUrl && supabaseUrl.includes('supabase')) {
      return createClient(supabaseUrl, supabaseAnonKey);
    } else {
      // If URL is missing or invalid, use dummy client with proper type assertion
      return createDummyClient() as unknown as ReturnType<typeof createClient>;
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return createDummyClient() as unknown as ReturnType<typeof createClient>;
  }
})();

/**
 * Testa a conexão com o Supabase
 */
export const testSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseUrl.includes('supabase')) {
      console.warn('Supabase connection skipped (URL not properly configured)');
      return false;
    }
    
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    // Se houver um erro específico sobre a tabela não existir, a conexão está OK
    // mas a tabela não existe (o que é normal)
    if (error && error.code === 'PGRST116') {
      console.log('Conexão com Supabase bem-sucedida (tabela de teste não existe)');
      return true;
    }
    
    // Outros erros indicam um problema de conexão
    if (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
    
    // Se não houver erro, a conexão está OK
    console.log('Conexão com Supabase bem-sucedida');
    return true;
  } catch (err) {
    console.error('Erro ao testar conexão:', err);
    return false;
  }
};

/**
 * Verifica se a tabela profiles existe e tem as colunas necessárias
 */
export const ensureProfilesTable = async () => {
  try {
    // Tenta executar a função RPC, que irá criar a tabela se não existir
    const { data, error } = await supabase.rpc('ensure_profiles_table');
    
    if (error) {
      console.error('Erro ao verificar tabela profiles:', error);
      
      // Se a função RPC não existe, vamos tentar criar manualmente
      if (error.message.includes('function "ensure_profiles_table" does not exist')) {
        console.log('Criando função ensure_profiles_table...');
        
        // Criar a função SQL
        const { error: sqlError } = await supabase.rpc('create_profile_table');
        
        if (sqlError) {
          console.error('Erro ao criar função ensure_profiles_table:', sqlError);
          
          // Último recurso: tentar verificar se a tabela existe diretamente
          try {
            const { data: tableInfo, error: tableError } = await supabase
              .from('profiles')
              .select('*')
              .limit(1);
              
            if (tableError && tableError.message.includes("relation \"profiles\" does not exist")) {
              console.error('Tabela profiles não existe e não foi possível criá-la automaticamente');
              return false;
            } else {
              console.log('Tabela profiles existe, mas pode não ter todas as colunas necessárias');
              return true;
            }
          } catch (e) {
            console.error('Erro ao verificar tabela profiles:', e);
            return false;
          }
        } else {
          console.log('Função ensure_profiles_table criada com sucesso');
          return true;
        }
      }
      
      return false;
    }
    
    console.log('Tabela profiles verificada com sucesso:', data);
    return true;
  } catch (err) {
    console.error('Erro ao verificar tabela profiles:', err);
    return false;
  }
};


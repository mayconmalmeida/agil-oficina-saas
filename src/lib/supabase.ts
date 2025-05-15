
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Testa a conexão com o Supabase
 */
export const testSupabaseConnection = async () => {
  try {
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


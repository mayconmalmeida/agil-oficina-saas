
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client from our integration
export const supabase = supabaseClient;

/**
 * Testa a conexão com o Supabase
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('Attempting to test Supabase connection...');
    
    // Uma forma simples de testar se a conexão está funcionando
    // é tentar fazer uma chamada de autenticação anônima
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro de conexão com Supabase:', error);
      if (error.message.includes('Failed to fetch')) {
        console.error('Erro de conexão de rede. Verifique sua internet ou as variáveis de ambiente.');
        return false;
      }
      return false;
    }
    
    console.log('Conexão com Supabase bem-sucedida:', data ? 'Dados recebidos' : 'Sem dados');
    return true;
  } catch (err) {
    console.error('Erro ao testar conexão com Supabase:', err);
    return false;
  }
};

/**
 * Verifica se a tabela profiles existe e tem as colunas necessárias
 */
export const ensureProfilesTable = async () => {
  try {
    console.log('Verificando se a tabela profiles existe...');
    
    // Attempt to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar tabela profiles:', error.message);
      
      // Table might not exist
      if (error.message.includes('does not exist')) {
        console.log('A tabela profiles não existe. Tentando criar...');
        
        // Try to create the table via RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_profile_table');
        
        if (rpcError) {
          console.error('Erro ao criar tabela profiles via RPC:', rpcError);
          return false;
        }
        
        console.log('Tabela profiles criada com sucesso via RPC');
        return true;
      }
      
      return false;
    }
    
    console.log('Tabela profiles existe e está acessível');
    return true;
  } catch (err) {
    console.error('Erro inesperado ao verificar tabela profiles:', err);
    return false;
  }
};

/**
 * Cria um perfil para um usuário caso não exista
 */
export const createProfileIfNotExists = async (userId: string, email: string, fullName?: string) => {
  try {
    console.log('Verificando se perfil existe para usuário:', userId);
    
    // Check if profile exists
    const { data: existingProfile, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (queryError) {
      // If error is not found, create profile
      if (queryError.code === 'PGRST116') {
        console.log('Perfil não encontrado, criando novo perfil para:', email);
        
        // Try direct insert first
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId, 
            email: email, 
            full_name: fullName || ''
          })
          .select();
        
        if (insertError) {
          console.error('Erro ao inserir perfil diretamente:', insertError);
          
          // Try via RPC function as fallback (bypasses RLS)
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'create_profile', 
              { user_id: userId, user_email: email, user_full_name: fullName || '' }
            );
            
            if (rpcError) {
              console.error('Erro ao criar perfil via RPC:', rpcError);
              return { success: false, error: rpcError };
            }
            
            console.log('Perfil criado com sucesso via RPC');
            return { success: true, profile: { id: userId, email } };
          } catch (rpcCatchErr) {
            console.error('Erro ao executar RPC para criar perfil:', rpcCatchErr);
            return { success: false, error: rpcCatchErr };
          }
        }
        
        console.log('Perfil criado com sucesso via insert direto');
        return { success: true, profile: insertData ? insertData[0] : { id: userId, email } };
      } else {
        console.error('Erro ao verificar perfil existente:', queryError);
        return { success: false, error: queryError };
      }
    }
    
    console.log('Perfil já existe para o usuário');
    return { success: true, profile: existingProfile };
    
  } catch (err) {
    console.error('Erro inesperado ao criar perfil:', err);
    return { success: false, error: err };
  }
};

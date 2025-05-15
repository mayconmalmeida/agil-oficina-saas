
import { supabase, testSupabaseConnection } from "@/lib/supabase";

/**
 * Verifies the connection with Supabase and checks for existing session
 */
export const verifyConnection = async () => {
  try {
    console.log("Verificando conexão com Supabase...");
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
      console.log("Conexão Supabase bem-sucedida");
      
      // Verificar se já existe uma sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verificar se a tabela de admins existe
      try {
        const { error: adminTableError } = await supabase
          .from('admins')
          .select('id')
          .limit(1);
          
        // Se a tabela não existir, criar
        if (adminTableError && adminTableError.message.includes('does not exist')) {
          // Aqui poderíamos criar a tabela admin via RPC, mas vamos apenas reportar o erro
          console.error("Tabela de admins não existe");
          return { 
            success: false, 
            error: 'A tabela de administradores não está configurada. Entre em contato com o suporte.'
          };
        }
      } catch (tableError) {
        console.error("Erro ao verificar tabela de admins:", tableError);
      }
      
      if (session) {
        console.log("Sessão existente encontrada", session);
        return { success: true, session };
      }
      
      return { success: true, session: null };
    } else {
      return { 
        success: false, 
        error: 'Não foi possível conectar ao serviço de autenticação.'
      };
    }
  } catch (error: any) {
    console.error("Erro ao verificar conexão com Supabase:", error);
    return { 
      success: false, 
      error: 'Falha ao verificar a conexão com o serviço de autenticação.'
    };
  }
};

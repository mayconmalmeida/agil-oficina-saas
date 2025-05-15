
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
      
      // Verificar se a tabela de admins existe e se tem dados
      try {
        const { data: adminsData, error: adminTableError } = await supabase
          .from('admins')
          .select('id, email')
          .limit(1);
          
        // Se a tabela não existir ou der erro
        if (adminTableError) {
          console.error("Erro ao acessar tabela de admins:", adminTableError);
          return { 
            success: false, 
            error: 'A tabela de administradores não está configurada corretamente. Entre em contato com o suporte.'
          };
        }
        
        // Verificar se há algum admin cadastrado
        if (adminsData && adminsData.length === 0) {
          console.log("Nenhum administrador cadastrado ainda");
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

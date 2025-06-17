
import { toast } from "@/hooks/use-toast";

/**
 * NOTA: A função createPredefinedAdmin foi removida porque agora
 * gerenciamos roles apenas através da tabela profiles.
 * 
 * Para criar um admin predefinido, execute o seguinte SQL no Supabase:
 * UPDATE profiles SET role = 'admin' WHERE email = 'mayconintermediacao@gmail.com';
 * 
 * Ou use a função RPC set_user_role se ela estiver disponível.
 */
export const createPredefinedAdmin = async () => {
  toast({
    variant: "destructive",
    title: "Funcionalidade desativada",
    description: "Administradores são criados através da atualização da role na tabela profiles. Execute: UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com'",
  });
  
  throw new Error("Função desativada - use a tabela profiles para gerenciar roles");
};

/**
 * Função segura para verificar se um usuário é admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Esta verificação agora usa apenas a tabela profiles
    const response = await fetch('/api/check-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return false;
  }
};

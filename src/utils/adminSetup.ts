
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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface LoginFormValues {
  email: string;
  password: string;
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("🔐 Tentando login:", values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("❌ Erro no login:", error);
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
        });
        return;
      }

      if (data.session && data.user) {
        console.log("✅ Login bem-sucedido:", data.user.email);
        
        // Buscar ou criar oficina para o usuário logado
        try {
          const { data: oficinaData, error: oficinaError } = await supabase.rpc('get_or_create_oficina', {
            p_user_id: data.user.id,
            p_email: data.user.email,
            p_nome_oficina: null,
            p_telefone: null
          });

          if (oficinaError) {
            console.error("⚠️ Erro ao buscar/criar oficina:", oficinaError);
          } else {
            console.log("✅ Oficina configurada:", oficinaData);
          }
        } catch (err) {
          console.error("⚠️ Erro na configuração da oficina:", err);
        }
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${data.user.email}`,
        });
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("💥 Erro inesperado:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleLogin,
  };
};

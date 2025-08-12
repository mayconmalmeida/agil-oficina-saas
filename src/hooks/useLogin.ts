
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
        
        // Check if oficina exists for this user
        try {
          const { data: oficinaData, error: oficinaError } = await supabase
            .from('oficinas')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (oficinaError && oficinaError.code === 'PGRST116') {
            // No oficina found, create one
            const { error: insertError } = await supabase
              .from('oficinas')
              .insert({
                user_id: data.user.id,
                email: data.user.email,
                nome_oficina: 'Nova Oficina',
                is_active: true,
                ativo: true
              });

            if (insertError) {
              console.error("⚠️ Erro ao criar oficina:", insertError);
            } else {
              console.log("✅ Nova oficina criada");
            }
          } else if (!oficinaError) {
            console.log("✅ Oficina existente encontrada:", oficinaData);
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


import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { safeRpc } from '@/utils/supabaseTypes';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import RegisterForm, { RegisterFormValues } from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    ensureRequiredTables();
  }, []);

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        console.error("Erro ao registrar:", error);
        toast({
          variant: "destructive",
          title: "Erro ao registrar",
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      console.log("Registro bem-sucedido, redirecionando para:", '/perfil-oficina');
      toast({
        title: "Registro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });
      navigate('/perfil-oficina');
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o registro. Tente novamente.",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ensureRequiredTables = async () => {
    try {
      setIsInitializing(true);
      
      // Check if profiles table exists and has required columns
      console.log("Verificando se tabela de perfis existe...");
      const { error: profilesError } = await safeRpc('create_profiles_table');
      
      if (profilesError) {
        console.error("Erro ao verificar tabela de perfis:", profilesError);
      } else {
        console.log("Tabela de perfis verificada com sucesso!");
      }
      
      // Check if subscriptions table exists
      console.log("Verificando se tabela de assinaturas existe...");
      const { error: subscriptionsError } = await safeRpc('create_subscriptions_table');
      
      if (subscriptionsError) {
        console.error("Erro ao verificar tabela de assinaturas:", subscriptionsError);
      } else {
        console.log("Tabela de assinaturas verificada com sucesso!");
      }
      
    } catch (error) {
      console.error("Erro ao inicializar tabelas:", error);
    } finally {
      setIsInitializing(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8">
        <div className="bg-white shadow-md rounded-md p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Crie sua conta
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Comece a gerenciar sua oficina de forma eficiente.
          </p>
          
          <RegisterForm 
            onSubmit={handleRegister}
            isLoading={isLoading || isInitializing}
          />
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-oficina-gray hover:underline">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

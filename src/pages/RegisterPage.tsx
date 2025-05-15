import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { safeRpc } from '@/utils/supabaseTypes';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { RegisterFormValues } from '@/components/auth/RegisterForm';

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
          
          {/* Formulário de registro */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const values = Object.fromEntries(formData.entries()) as unknown as RegisterFormValues;
              handleRegister(values);
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-oficina hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading || isInitializing}
              >
                {isLoading || isInitializing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </button>
            </div>
          </form>
          
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


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import { Crown } from "lucide-react";
import { useSubscription } from '@/hooks/useSubscription';
import RegistrationForm from '@/components/auth/RegistrationForm';
import ConnectionStatus from '@/components/auth/ConnectionStatus';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') as 'essencial' | 'premium' | null;
  const { startFreeTrial } = useSubscription();

  // Verificar conexão com o Supabase
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        setConnectionStatus('checking');
        console.log("Verificando conexão com Supabase na página de registro...");
        const connected = await testSupabaseConnection();
        setConnectionStatus(connected ? 'connected' : 'error');
        
        if (!connected) {
          setConnectionError("Não foi possível conectar ao servidor. O sistema funcionará em modo de demonstração.");
          console.log("Conexão com Supabase falhou, usando modo demo");
        } else {
          console.log("Conexão com Supabase estabelecida com sucesso");
          setConnectionError(null);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('error');
        setConnectionError("Erro ao verificar conexão com o servidor: " + 
          (error instanceof Error ? error.message : "Erro desconhecido"));
      }
    };
    
    verifyConnection();
  }, []);

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      if (connectionStatus !== 'connected') {
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não é possível registrar sem uma conexão com o servidor.",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
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

      // Se o registro foi bem-sucedido e há um usuário
      if (data.user) {
        toast({
          title: "Registro bem-sucedido!",
          description: selectedPlan 
            ? `Conta criada! Iniciando seu teste gratuito do plano ${selectedPlan === 'premium' ? 'Premium' : 'Essencial'}...`
            : "Conta criada com sucesso!"
        });

        // Se há um plano selecionado, aguardar um momento para o usuário estar autenticado
        // e então iniciar o teste gratuito
        if (selectedPlan) {
          setTimeout(async () => {
            try {
              const result = await startFreeTrial(selectedPlan);
              if (result.success) {
                toast({
                  title: "Teste gratuito ativado!",
                  description: `Seu teste de 7 dias do plano ${selectedPlan === 'premium' ? 'Premium' : 'Essencial'} foi iniciado.`
                });
                navigate('/dashboard');
              } else {
                // Se falhar ao iniciar o trial, redirecionar para login
                navigate('/login');
              }
            } catch (error) {
              console.error("Erro ao iniciar teste:", error);
              navigate('/login');
            }
          }, 2000);
        } else {
          // Redirect to login page se não há plano selecionado
          navigate('/login');
        }
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o registro. Verifique sua conexão.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="text-2xl font-bold text-oficina-dark">
            Oficina<span className="text-oficina-accent">Ágil</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {selectedPlan ? 'Criar conta e iniciar teste' : 'Criar conta'}
            </CardTitle>
            <CardDescription className="text-center">
              {selectedPlan 
                ? `Crie sua conta para começar o teste gratuito do plano ${selectedPlan === 'premium' ? 'Premium' : 'Essencial'}`
                : 'Digite suas informações para criar uma conta'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {selectedPlan && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Crown className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Plano selecionado: {selectedPlan === 'premium' ? 'Premium' : 'Essencial'}</strong>
                  <br />
                  Você terá 7 dias de teste gratuito com acesso completo aos recursos.
                </AlertDescription>
              </Alert>
            )}

            <ConnectionStatus status={connectionStatus} error={connectionError} />
            
            <RegistrationForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              isConnected={connectionStatus === 'connected'}
              selectedPlan={selectedPlan || undefined}
            />
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-oficina hover:underline">
                Faça login aqui
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

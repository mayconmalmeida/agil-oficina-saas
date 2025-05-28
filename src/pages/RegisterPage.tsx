
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import { CheckCircle2, AlertTriangle, WifiOff, Crown } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSubscription } from '@/hooks/useSubscription';

// Define the form schema
const registerFormSchema = z.object({
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha")
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') as 'essencial' | 'premium' | null;
  const { startFreeTrial } = useSubscription();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

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

            {connectionStatus === 'checking' && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <div className="animate-pulse flex items-center">
                  <div className="h-4 w-4 bg-blue-400 rounded-full mr-2"></div>
                  <AlertDescription className="text-blue-600">
                    Verificando conexão com o servidor...
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-300">
                <WifiOff className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <strong>⚠️ Sistema em Modo de Demonstração</strong><br />
                  Estamos enfrentando problemas de conexão com o servidor.<br />
                  O registro não funcionará até que a conexão seja restaurada.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'connected' && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Conexão com o servidor estabelecida.
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="exemplo@oficina.com" 
                          type="email" 
                          disabled={isLoading || connectionStatus !== 'connected'}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="******" 
                          type="password"
                          disabled={isLoading || connectionStatus !== 'connected'}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="******" 
                          type="password"
                          disabled={isLoading || connectionStatus !== 'connected'}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-oficina hover:bg-blue-700"
                  disabled={isLoading || connectionStatus !== 'connected'}
                >
                  {isLoading ? "Registrando..." : selectedPlan ? "Criar conta e iniciar teste" : "Registrar"}
                </Button>
              </form>
            </Form>
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

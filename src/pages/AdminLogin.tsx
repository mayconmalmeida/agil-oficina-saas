
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar conexão com o Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("Verificando conexão com Supabase...");
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log("Conexão Supabase bem-sucedida");
          setConnectionStatus('connected');
          
          // Verificar se já existe uma sessão
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log("Sessão existente encontrada", session);
            checkAdminStatus(session);
          }
        } else {
          setConnectionStatus('error');
          setErrorMessage('Não foi possível conectar ao serviço de autenticação.');
        }
      } catch (error) {
        console.error("Erro ao verificar conexão com Supabase:", error);
        setConnectionStatus('error');
        setErrorMessage('Falha ao verificar a conexão com o serviço de autenticação.');
      }
    };
    
    checkConnection();
  }, [navigate]);

  const checkAdminStatus = async (session: any) => {
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .single();
        
      if (adminData) {
        toast({
          title: "Já autenticado",
          description: "Redirecionando para o painel administrativo.",
        });
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Erro ao verificar status de admin:", error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Iniciando login admin com:", values.email);
      
      // Verificar novamente a conexão antes de tentar login
      if (connectionStatus === 'error') {
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          setErrorMessage(error.message || 'Erro desconhecido durante o login');
        }
        
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message || "Ocorreu um erro durante o login",
        });
        return;
      }

      console.log("Login bem-sucedido, verificando se é admin");
      
      // Verifica se o usuário é um administrador
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', values.email)
        .single();

      if (adminError || !adminData) {
        console.error("Erro ao verificar admin:", adminError);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
        return;
      }

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel de administração.",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      setErrorMessage('Ocorreu um erro durante o login. ' + (error.message || ''));
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus === 'connected' && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Conexão com o servidor estabelecida.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Problema de conexão com o servidor. Verifique sua conexão com a internet.
                </AlertDescription>
              </Alert>
            )}
            
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="exemplo@oficinagil.com.br"
                          type="email"
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || connectionStatus === 'checking'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : connectionStatus === 'checking' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando conexão...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col space-y-2">
            <Button
              variant="link"
              onClick={() => navigate("/")}
            >
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

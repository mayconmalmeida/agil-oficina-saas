
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
import { Loader2, AlertCircle } from "lucide-react";
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
        // Tentar obter a sessão atual como teste de conexão básico
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Verificação de conexão Supabase:", session ? "Conectado com sessão" : "Conectado sem sessão");
        setConnectionStatus('connected');
        
        // Se já estiver autenticado como admin, redirecionar
        if (session) {
          checkAdminStatus(session);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão com Supabase:", error);
        setConnectionStatus('error');
        setErrorMessage('Não foi possível conectar ao serviço de autenticação. Verifique sua conexão ou tente novamente mais tarde.');
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
        if (error.message.includes('Failed to fetch')) {
          setErrorMessage('Falha na conexão com o servidor de autenticação. Verifique sua conexão com a internet ou se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas corretamente.');
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          setErrorMessage(`${error.message || 'Erro desconhecido durante o login'}`);
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
      setErrorMessage('Ocorreu um erro durante o login. Verifique sua conexão com a internet e se as variáveis de ambiente estão configuradas corretamente.');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o login. Verifique sua conexão.",
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
            {connectionStatus === 'error' && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Problema de conexão com o servidor. Verifique as variáveis de ambiente do Supabase.
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
            <p className="text-xs text-gray-500 text-center">
              Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para conectar ao Supabase.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

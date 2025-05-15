
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tablesChecked, setTablesChecked] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [planoSelecionado, setPlanoSelecionado] = useState<string>("premium"); // default
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const planoParam = queryParams.get('plano');
    if (planoParam && ['essencial', 'premium'].includes(planoParam)) {
      setPlanoSelecionado(planoParam);
    }
    
    // Verificar se as tabelas existem
    checkAndCreateTables();
  }, [location]);

  // Função para verificar e criar tabelas necessárias
  const checkAndCreateTables = async () => {
    try {
      // Verificar se a tabela profiles existe
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      // Se a tabela não existir, criá-la
      if (profilesError && profilesError.message.includes('does not exist')) {
        await supabase.rpc('create_profiles_table');
      }

      // Verificar se a tabela subscriptions existe
      const { error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('id')
        .limit(1);

      // Se a tabela não existir, criá-la
      if (subscriptionsError && subscriptionsError.message.includes('does not exist')) {
        await supabase.rpc('create_subscriptions_table');
      }

      setTablesChecked(true);
    } catch (error) {
      console.error("Erro ao verificar tabelas:", error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      telefone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // 1. Registrar o usuário com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            telefone: values.telefone,
            plano: planoSelecionado
          }
        }
      });

      if (authError) {
        toast({
          variant: "destructive",
          title: "Erro ao registrar",
          description: authError.message,
        });
        return;
      }

      // 2. Adicionar perfil na tabela de perfis
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user?.id,
            email: values.email,
            full_name: values.full_name,
          }
        ]);

      if (profileError) {
        toast({
          variant: "destructive",
          title: "Erro ao criar perfil",
          description: profileError.message,
        });
        return;
      }

      // 3. Criar uma assinatura de teste
      const dataAtual = new Date();
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 7); // 7 dias de teste

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([
          { 
            user_id: authData.user?.id,
            plan: planoSelecionado,
            status: 'trial',
            started_at: dataAtual.toISOString(),
            ends_at: dataExpiracao.toISOString(),
          }
        ]);

      if (subscriptionError) {
        toast({
          variant: "destructive",
          title: "Erro ao criar assinatura",
          description: subscriptionError.message,
        });
        return;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao OficinaÁgil. Seu período de teste de 7 dias foi iniciado.",
      });

      // Redirecionar para o dashboard do cliente
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro durante o cadastro. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link to="/" className="text-2xl font-bold text-oficina-dark">
              Oficina<span className="text-oficina-accent">Ágil</span>
            </Link>
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Experimente Grátis</CardTitle>
              <CardDescription className="text-center">
                Crie sua conta e comece a usar o OficinaÁgil agora mesmo.
                <div className="mt-2 font-semibold text-oficina">
                  Plano selecionado: {planoSelecionado === 'premium' ? 'Premium' : 'Essencial'}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da sua oficina" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98765-4321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-oficina-accent hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Processando...
                      </>
                    ) : (
                      'Iniciar Teste Gratuito'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm">
              <p className="text-gray-500">
                Ao criar uma conta, você concorda com nossos 
                <Link to="/termos" className="text-oficina hover:underline mx-1">Termos de Serviço</Link> 
                e 
                <Link to="/privacidade" className="text-oficina hover:underline mx-1">Política de Privacidade</Link>.
              </p>
              <p>
                Já tem uma conta?
                <Link to="/login" className="text-oficina hover:underline ml-1">
                  Entre aqui
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-oficina">
          <div className="flex flex-col h-full justify-center items-center px-8">
            <div className="max-w-md text-center text-white">
              <h2 className="text-3xl font-bold mb-6">Experimente o OficinaÁgil por 7 dias sem compromisso</h2>
              <ul className="space-y-4 text-left list-disc pl-6 mb-8">
                <li>Orçamentos profissionais em segundos</li>
                <li>Gestão completa de clientes e veículos</li>
                <li>Controle de estoque e serviços</li>
                <li>Aumente suas vendas e fidelização</li>
                <li>Interface simples e intuitiva</li>
              </ul>
              <p className="text-sm opacity-80">Sem necessidade de cartão de crédito. Cancele quando quiser.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

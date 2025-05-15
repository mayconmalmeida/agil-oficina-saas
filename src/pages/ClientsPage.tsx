
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  veiculo: z.string().min(1, 'Informação do veículo é obrigatória'),
});

const ClientsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { updateProgress } = useOnboardingProgress(userId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      veiculo: '',
    },
  });
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Acesso não autorizado",
          description: "Você precisa fazer login para acessar este recurso.",
        });
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkUser();
  }, [navigate, toast]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para adicionar clientes.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create clients table if not exists using RPC function
      const { error } = await supabase.rpc('create_client', {
        p_user_id: userId,
        p_nome: values.nome,
        p_telefone: values.telefone,
        p_email: values.email || null,
        p_veiculo: values.veiculo
      });
      
      if (error) {
        console.error('Erro ao adicionar cliente:', error);
        toast({
          variant: "destructive",
          title: "Erro ao adicionar cliente",
          description: error.message || "Ocorreu um erro ao adicionar o cliente.",
        });
        return;
      }
      
      // Mark clients as added
      await updateProgress('clients_added', true);
      
      // Show success state
      setSaveSuccess(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/produtos-servicos');
      }, 1500);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao adicionar o cliente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipStep = async () => {
    if (userId) {
      await updateProgress('clients_added', true);
      navigate('/produtos-servicos');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-oficina-dark">
            Adicione seu Primeiro Cliente
          </h1>
          <p className="mt-2 text-oficina-gray">
            Cadastre os dados básicos do cliente e seu veículo
          </p>
          
          <div className="mt-4">
            <Progress value={50} className="h-2 w-full max-w-xs mx-auto" />
            <p className="text-xs text-oficina-gray mt-1">Etapa 2 de 4</p>
          </div>
        </div>
        
        <Card className={`transition-all duration-300 ${saveSuccess ? 'border-green-500 shadow-md' : ''}`}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Dados do Cliente</span>
              {saveSuccess && <CheckCircle className="h-5 w-5 text-green-500 animate-fade-in" />}
            </CardTitle>
            <CardDescription>
              Informações para contato e identificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="João da Silva" 
                          {...field}
                          disabled={saveSuccess}
                          className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                        />
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
                        <Input 
                          placeholder="(11) 99999-9999" 
                          {...field}
                          disabled={saveSuccess}
                          className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                        />
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
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="cliente@exemplo.com" 
                          type="email"
                          {...field}
                          disabled={saveSuccess}
                          className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="veiculo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veículo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Fiat Uno 2018, Placa ABC-1234" 
                          {...field}
                          disabled={saveSuccess}
                          className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className={`w-full transition-colors ${saveSuccess 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-oficina hover:bg-blue-700"}`}
                  disabled={isLoading || saveSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Adicionando...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Cliente adicionado!
                    </>
                  ) : (
                    'Adicionar Cliente e Continuar'
                  )}
                </Button>
                
                {!saveSuccess && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="link" 
                      onClick={skipStep}
                      type="button"
                    >
                      Pular esta etapa por enquanto
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientsPage;

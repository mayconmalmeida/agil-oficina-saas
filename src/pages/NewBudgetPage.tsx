
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

const formSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor_total: z.string().refine((val) => !isNaN(Number(val.replace(',', '.'))), {
    message: 'Valor deve ser um número válido'
  }),
});

const NewBudgetPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { updateProgress } = useOnboardingProgress(userId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      valor_total: '',
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
        description: "Você precisa estar logado para criar orçamentos.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create budgets table if not exists using RPC function
      const { error } = await supabase.rpc('create_budget', {
        p_user_id: userId,
        p_cliente: values.cliente,
        p_veiculo: values.veiculo,
        p_descricao: values.descricao,
        p_valor_total: parseFloat(values.valor_total.replace(',', '.'))
      });
      
      if (error) {
        console.error('Erro ao criar orçamento:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar orçamento",
          description: error.message || "Ocorreu um erro ao criar o orçamento.",
        });
        return;
      }
      
      // Mark budget as created
      await updateProgress('budget_created', true);
      
      toast({
        title: "Orçamento criado com sucesso!",
        description: "Seu primeiro orçamento foi criado com sucesso.",
      });
      
      // Reset form
      form.reset();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao criar o orçamento.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipStep = async () => {
    if (userId) {
      await updateProgress('budget_created', true);
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-oficina-dark">
            Crie seu Primeiro Orçamento
          </h1>
          <p className="mt-2 text-oficina-gray">
            Registre um orçamento para seu cliente
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Dados do Orçamento</CardTitle>
            <CardDescription>
              Informe os detalhes do serviço a ser realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="João da Silva" 
                          {...field} 
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Serviço</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Revisão completa com troca de óleo e filtros" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valor_total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="299,90" 
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Criando...
                    </>
                  ) : (
                    'Criar Orçamento e Finalizar'
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    onClick={skipStep}
                    type="button"
                  >
                    Pular esta etapa por enquanto
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBudgetPage;

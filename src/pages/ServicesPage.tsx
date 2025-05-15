
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

const formSchema = z.object({
  nome: z.string().min(1, 'Nome do serviço/produto é obrigatório'),
  tipo: z.enum(['servico', 'produto'], { 
    required_error: 'Selecione o tipo',
    invalid_type_error: 'Tipo inválido'
  }),
  valor: z.string().refine((val) => !isNaN(Number(val.replace(',', '.'))), {
    message: 'Valor deve ser um número válido'
  }),
  descricao: z.string().optional(),
});

const ServicesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { updateProgress } = useOnboardingProgress(userId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      tipo: 'servico',
      valor: '',
      descricao: '',
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
        description: "Você precisa estar logado para adicionar serviços/produtos.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create services table if not exists using RPC function
      const { error } = await supabase.rpc('create_service', {
        p_user_id: userId,
        p_nome: values.nome,
        p_tipo: values.tipo,
        p_valor: parseFloat(values.valor.replace(',', '.')),
        p_descricao: values.descricao || null
      });
      
      if (error) {
        console.error('Erro ao adicionar serviço/produto:', error);
        toast({
          variant: "destructive",
          title: "Erro ao adicionar serviço/produto",
          description: error.message || "Ocorreu um erro ao adicionar o serviço/produto.",
        });
        return;
      }
      
      // Mark services as added
      await updateProgress('services_added', true);
      
      toast({
        title: "Serviço/produto adicionado com sucesso!",
        description: "Vamos continuar com os próximos passos.",
      });
      
      // Reset form
      form.reset();
      
      // Navigate to budget page
      navigate('/orcamentos/novo');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao adicionar o serviço/produto.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const skipStep = async () => {
    if (userId) {
      await updateProgress('services_added', true);
      navigate('/orcamentos/novo');
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-oficina-dark">
            Adicione um Serviço ou Produto
          </h1>
          <p className="mt-2 text-oficina-gray">
            Cadastre serviços e produtos que sua oficina oferece
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Serviço ou Produto</CardTitle>
            <CardDescription>
              Informe os detalhes do serviço ou produto oferecido
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
                          placeholder="Troca de óleo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="servico">Serviço</SelectItem>
                          <SelectItem value="produto">Produto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="99,90" 
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
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Troca de óleo com filtro incluído" 
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
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar e Continuar'
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

export default ServicesPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  nome_oficina: z.string().min(1, 'Nome da oficina é obrigatório'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
});

const ProfileSetupPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { updateProgress } = useOnboardingProgress(userId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_oficina: '',
      telefone: '',
      endereco: '',
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
      
      // Fetch existing profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data && !error) {
        form.setValue('nome_oficina', data.nome_oficina || '');
        form.setValue('telefone', data.telefone || '');
        form.setValue('endereco', data.endereco || '');
      }
    };
    
    checkUser();
  }, [navigate, toast, form]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para salvar seu perfil.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_oficina: values.nome_oficina,
          telefone: values.telefone,
          endereco: values.endereco
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar perfil",
          description: error.message || "Ocorreu um erro ao salvar seu perfil.",
        });
        return;
      }
      
      // Mark profile as completed
      await updateProgress('profile_completed', true);
      
      // Show success animation
      setSaveSuccess(true);
      
      // Navigate after a short delay to show the success state
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao salvar seu perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-oficina-dark">
            Configure sua Oficina
          </h1>
          <p className="mt-2 text-oficina-gray">
            Preencha as informações básicas da sua oficina
          </p>
          
          <div className="mt-4">
            <Progress value={25} className="h-2 w-full max-w-xs mx-auto" />
            <p className="text-xs text-oficina-gray mt-1">Etapa 1 de 4</p>
          </div>
        </div>
        
        <Card className={`transition-all duration-300 ${saveSuccess ? 'border-green-500 shadow-md' : ''}`}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Informações da Oficina</span>
              {saveSuccess && <CheckCircle className="h-5 w-5 text-green-500 animate-fade-in" />}
            </CardTitle>
            <CardDescription>
              Estas informações aparecerão nos orçamentos e comunicações com seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome_oficina"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Oficina</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Auto Center São Paulo" 
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
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Av. Paulista, 1000 - São Paulo/SP" 
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
                      Salvando...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Salvo com sucesso!
                    </>
                  ) : (
                    'Salvar e Continuar'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetupPage;

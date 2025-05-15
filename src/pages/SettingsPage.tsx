import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import SupportSettings from '@/components/settings/SupportSettings';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, { message: 'A senha atual é obrigatória' }),
  newPassword: z.string().min(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A confirmação de senha é obrigatória' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

const profileUpdateSchema = z.object({
  nome_oficina: z.string().min(3, { message: 'O nome da oficina é obrigatório' }).optional(),
  cnpj: z.string().optional(),
  responsavel: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [isLoading, setIsLoading] = useState(false);
  const [themeSetting, setThemeSetting] = useState('light');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userProfile, loading: isLoadingProfile } = useUserProfile();
  
  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      nome_oficina: userProfile?.nome_oficina || '',
      cnpj: userProfile?.cnpj || '',
      responsavel: userProfile?.responsavel || '',
      telefone: userProfile?.telefone || '',
      endereco: userProfile?.endereco || '',
      cidade: userProfile?.cidade || '',
      estado: userProfile?.estado || '',
      cep: userProfile?.cep || '',
    },
  });
  
  // Update form values when profile is loaded
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        nome_oficina: userProfile?.nome_oficina || '',
        cnpj: userProfile?.cnpj || '',
        responsavel: userProfile?.responsavel || '',
        telefone: userProfile?.telefone || '',
        endereco: userProfile?.endereco || '',
        cidade: userProfile?.cidade || '',
        estado: userProfile?.estado || '',
        cep: userProfile?.cep || '',
      });
    }
  }, [userProfile, profileForm]);
  
  const handleChangePassword = async (values: z.infer<typeof passwordChangeSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao alterar senha",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      passwordForm.reset();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateProfile = async (values: z.infer<typeof profileUpdateSchema>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado.",
        });
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user.id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar perfil",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao sair",
          description: error.message,
        });
        return;
      }
      
      navigate('/login');
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
      });
    }
  };
  
  const toggleTheme = () => {
    const newTheme = themeSetting === 'light' ? 'dark' : 'light';
    setThemeSetting(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };
  
  if (isLoadingProfile) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="perfil">Perfil da Oficina</TabsTrigger>
                <TabsTrigger value="seguranca">Segurança</TabsTrigger>
                <TabsTrigger value="aparencia">Aparência</TabsTrigger>
                <TabsTrigger value="suporte">Suporte</TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium">Informações da Oficina</h2>
                    <p className="text-sm text-gray-500">Atualize as informações da sua oficina</p>
                  </div>
                  
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="nome_oficina"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Oficina</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="responsavel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsável</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <FormField
                            control={profileForm.control}
                            name="endereco"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="cidade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="estado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="cep"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
              
              <TabsContent value="seguranca">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium">Alterar Senha</h2>
                    <p className="text-sm text-gray-500">Atualize sua senha para manter sua conta segura</p>
                  </div>
                  
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha Atual</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Nova Senha</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-medium">Sessão</h2>
                      <p className="text-sm text-gray-500">Encerre todas as sessões ativas</p>
                    </div>
                    
                    <Button variant="destructive" onClick={handleLogout}>
                      Sair de Todos os Dispositivos
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="aparencia">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium">Tema</h2>
                    <p className="text-sm text-gray-500">Personalize a aparência da plataforma</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col gap-2">
                      <span className="font-medium">Modo Escuro</span>
                      <span className="text-sm text-gray-500">Habilite o modo escuro para reduzir o cansaço visual à noite</span>
                    </div>
                    <Switch
                      checked={themeSetting === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="suporte">
                <SupportSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

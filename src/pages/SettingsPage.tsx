
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import SupportSettings from '@/components/settings/SupportSettings';
import NotificationsSettings from '@/components/settings/NotificationsSettings';
import { Building, Palette, Bell, Phone } from 'lucide-react';
import { 
  ProfileSection, 
  profileUpdateSchema,
  type ProfileFormValues
} from '@/components/settings/ProfileSection';
import { 
  SecuritySection, 
  passwordChangeSchema,
  type PasswordFormValues
} from '@/components/settings/SecuritySection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [isLoading, setIsLoading] = useState(false);
  const [themeSetting, setThemeSetting] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userProfile, loading: isLoadingProfile } = useUserProfile();
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const profileForm = useForm<ProfileFormValues>({
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
  
  // Apply theme on initial load and when it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeSetting === 'dark');
  }, [themeSetting]);
  
  const handleChangePassword = async (values: PasswordFormValues) => {
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
  
  const handleUpdateProfile = async (values: ProfileFormValues) => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Configurações</h1>
        </div>
        
        <Card className="dark:bg-gray-800">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-1">
                <TabsTrigger value="perfil" className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Oficina</span>
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Segurança</span>
                </TabsTrigger>
                <TabsTrigger value="aparencia" className="flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Aparência</span>
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Notificações</span>
                </TabsTrigger>
                <TabsTrigger value="suporte" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Suporte</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil">
                <ProfileSection 
                  form={profileForm} 
                  onSubmit={handleUpdateProfile} 
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="seguranca">
                <SecuritySection 
                  passwordForm={passwordForm}
                  onPasswordChange={handleChangePassword}
                  onLogout={handleLogout}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="aparencia">
                <AppearanceSection 
                  themeSetting={themeSetting} 
                  onToggleTheme={toggleTheme}
                />
              </TabsContent>
              
              <TabsContent value="notificacoes">
                <NotificationsSettings />
              </TabsContent>
              
              <TabsContent value="suporte">
                <SupportSettings 
                  userId={userProfile?.id}
                  initialValues={{
                    whatsapp_suporte: userProfile?.whatsapp_suporte
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

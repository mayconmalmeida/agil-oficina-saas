import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { profileUpdateSchema, type ProfileFormValues } from '@/components/settings/ProfileSection';
import { passwordChangeSchema, type PasswordFormValues } from '@/components/settings/SecuritySection';

export const useSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [isLoading, setIsLoading] = useState(false);
  const [themeSetting, setThemeSetting] = useState(() => {
    // Get theme from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userProfile, loading: isLoadingProfile, userId } = useUserProfile();
  
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
  
  // Apply theme globally on initial load and when it changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (themeSetting === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
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
    
    // Apply theme globally to entire SaaS
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
    
    localStorage.setItem('theme', newTheme);
  };
  
  return {
    activeTab, 
    setActiveTab,
    isLoading,
    isLoadingProfile,
    themeSetting,
    userProfile,
    userId,
    profileForm,
    passwordForm,
    handleUpdateProfile,
    handleChangePassword,
    handleLogout,
    toggleTheme
  };
};

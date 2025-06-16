
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { profileSchema, ProfileFormValues } from '@/components/profile/profileSchema';

interface UseProfileFormProps {
  userId: string | undefined;
  onSaveSuccess: () => void;
  initialValues?: any;
}

export const useProfileForm = ({ 
  userId, 
  onSaveSuccess, 
  initialValues = {} 
}: UseProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
      email: initialValues.email || '',
      cnpj: initialValues.cnpj || '',
      responsavel: initialValues.responsavel || '',
      endereco: initialValues.endereco || '',
      cidade: initialValues.cidade || '',
      estado: initialValues.estado || '',
      cep: initialValues.cep || '',
      logo_url: initialValues.logo_url || '',
      whatsapp_suporte: initialValues.whatsapp_suporte || '',
      full_name: initialValues.full_name || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) {
      console.error('UserId não fornecido para salvar perfil');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro de autenticação. Faça login novamente.",
      });
      return;
    }

    setIsLoading(true);
    console.log('Salvando perfil completo para usuário:', userId, 'com dados:', values);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nome_oficina: values.nome_oficina,
          telefone: values.telefone,
          email: values.email || null,
          cnpj: values.cnpj || null,
          responsavel: values.responsavel || null,
          endereco: values.endereco || null,
          cidade: values.cidade || null,
          estado: values.estado || null,
          cep: values.cep || null,
          logo_url: values.logo_url || null,
          whatsapp_suporte: values.whatsapp_suporte || null,
          full_name: values.full_name || null,
        })
        .select();

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível salvar as informações. Tente novamente.",
        });
        return;
      }

      console.log('Perfil completo salvo com sucesso:', data);
      setSaveSuccess(true);
      
      toast({
        title: "Perfil salvo com sucesso!",
        description: "Suas informações foram atualizadas.",
      });

      // Chamar callback de sucesso após breve delay
      setTimeout(() => {
        onSaveSuccess();
      }, 500);

    } catch (error) {
      console.error('Erro inesperado ao salvar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    saveSuccess,
    onSubmit,
  };
};

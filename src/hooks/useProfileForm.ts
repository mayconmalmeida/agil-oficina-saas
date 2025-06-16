
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { profileFormSchema, ProfileFormValues } from '@/components/profile/profileSchema';

interface UseProfileFormProps {
  userId: string | undefined;
  onSaveSuccess: () => void;
  initialValues?: {
    nome_oficina?: string;
    telefone?: string;
  };
}

export const useProfileForm = ({ 
  userId, 
  onSaveSuccess, 
  initialValues = { nome_oficina: '', telefone: '' } 
}: UseProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
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
    console.log('Salvando perfil para usuário:', userId, 'com dados:', values);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nome_oficina: values.nome_oficina,
          telefone: values.telefone,
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

      console.log('Perfil salvo com sucesso:', data);
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

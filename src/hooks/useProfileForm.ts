
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

export const useProfileForm = ({ userId, onSaveSuccess, initialValues = { nome_oficina: '', telefone: '' } }: UseProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
    },
    mode: 'onBlur', // Validate on blur for better user experience
  });
  
  const onSubmit = async (values: ProfileFormValues) => {
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
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (existingProfile) {
        // Profile exists, update it
        const { error } = await supabase
          .from('profiles')
          .update({
            nome_oficina: values.nome_oficina,
            telefone: values.telefone,
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
      } else {
        // Profile doesn't exist, insert it
        const { error } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            nome_oficina: values.nome_oficina,
            telefone: values.telefone,
          }]);
          
        if (error) {
          console.error('Erro ao criar perfil:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar perfil",
            description: error.message || "Ocorreu um erro ao salvar seu perfil.",
          });
          return;
        }
      }
      
      // Show success animation
      setSaveSuccess(true);
      
      // Call the onSaveSuccess callback
      setTimeout(() => {
        onSaveSuccess();
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

  return {
    form,
    isLoading,
    saveSuccess,
    onSubmit
  };
};

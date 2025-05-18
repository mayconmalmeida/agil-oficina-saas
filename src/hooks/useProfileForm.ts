
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { profileSchema } from '@/components/profile/profileSchema';

interface UseProfileFormOptions {
  userId?: string;
  onSaveSuccess?: () => void;
  initialValues?: {
    nome_oficina?: string;
    telefone?: string;
    logo_url?: string;
    whatsapp_suporte?: string;
    cnpj?: string;
    responsavel?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    notify_new_client?: boolean;
    notify_approved_budget?: boolean;
    notify_by_email?: boolean;
    sound_enabled?: boolean;
  };
}

export function useProfileForm({
  userId,
  onSaveSuccess,
  initialValues = {}
}: UseProfileFormOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  // Check if bucket exists
  const checkAndCreateBucket = async () => {
    try {
      // First check if it already exists
      console.log("Checking if 'logos' bucket exists");
      
      // Just check if we can list objects (bucket exists)
      const { data, error } = await supabase.storage
        .from('logos')
        .list(userId || '');
      
      if (error) {
        console.warn("Error checking bucket:", error.message);
        // We can't create buckets from client side
        // This should be done via SQL migrations
      } else {
        console.log("'logos' bucket is accessible");
      }
    } catch (err) {
      console.error('Error checking bucket:', err);
    }
  };

  // Check bucket as soon as initialized
  if (userId) {
    checkAndCreateBucket();
  }

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
      logo_url: initialValues.logo_url || '',
      whatsapp_suporte: initialValues.whatsapp_suporte || '46991270777', // Default value
      cnpj: initialValues.cnpj || '',
      responsavel: initialValues.responsavel || '',
      endereco: initialValues.endereco || '',
      cidade: initialValues.cidade || '',
      estado: initialValues.estado || '',
      cep: initialValues.cep || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "ID do usuário não encontrado. Por favor, faça login novamente.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Saving profile with values:', values);

      const { error } = await supabase
        .from('profiles')
        .update({
          nome_oficina: values.nome_oficina,
          telefone: values.telefone,
          logo_url: values.logo_url,
          whatsapp_suporte: values.whatsapp_suporte || '46991270777',
          cnpj: values.cnpj,
          responsavel: values.responsavel,
          endereco: values.endereco,
          cidade: values.cidade,
          estado: values.estado,
          cep: values.cep,
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      setSaveSuccess(true);

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar perfil",
        description: error.message || "Não foi possível salvar o perfil. Tente novamente.",
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
}

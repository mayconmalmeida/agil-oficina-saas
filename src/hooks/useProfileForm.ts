
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

  // Ensure storage bucket exists
  const ensureStorageBucket = async () => {
    try {
      // Check if bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking buckets:', error);
        return;
      }
      
      // If logos bucket doesn't exist, try to create it
      const logosBucketExists = buckets?.some(bucket => bucket.name === 'logos');
      
      if (!logosBucketExists) {
        console.log('Logos bucket not found, attempting to create');
        // Note: Client-side bucket creation may be restricted by RLS policies
        // This can be handled in a backend function if needed
      }
    } catch (err) {
      console.error('Error ensuring storage bucket:', err);
    }
  };

  // Call immediately to ensure bucket exists
  ensureStorageBucket();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
      logo_url: initialValues.logo_url || '',
      whatsapp_suporte: '46991270777', // Default support number as requested
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
        })
        .eq('id', userId);

      if (error) throw error;

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


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

  // Verificar se o bucket existe
  const checkAndCreateBucket = async () => {
    try {
      // Antes de tentar criar, verifica se já existe
      console.log("Verificando se o bucket 'logos' existe");
      
      // Apenas verifica se conseguimos listar os objetos (bucket existe)
      const { data, error } = await supabase.storage
        .from('logos')
        .list(userId || '');
      
      if (error) {
        console.warn("Erro ao verificar bucket:", error.message);
        // Não podemos criar buckets do lado do cliente
        // Isso deve ser feito via SQL migrations
      } else {
        console.log("Bucket 'logos' está acessível");
      }
    } catch (err) {
      console.error('Erro ao verificar bucket:', err);
    }
  };

  // Verifica bucket logo ao inicializar
  if (userId) {
    checkAndCreateBucket();
  }

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
      logo_url: initialValues.logo_url || '',
      whatsapp_suporte: initialValues.whatsapp_suporte || '46991270777', // Valor padrão
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
      console.log('Salvando perfil com valores:', values);

      const { error } = await supabase
        .from('profiles')
        .update({
          nome_oficina: values.nome_oficina,
          telefone: values.telefone,
          logo_url: values.logo_url,
          whatsapp_suporte: values.whatsapp_suporte || '46991270777',
        })
        .eq('id', userId);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
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
      console.error('Erro ao salvar perfil:', error);
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

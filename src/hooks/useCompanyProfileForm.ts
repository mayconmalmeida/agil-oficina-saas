
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { companyFormSchema, CompanyFormValues } from '@/components/company/companyProfileSchema';

interface UseCompanyProfileFormProps {
  initialData: any;
  onSave: () => void;
}

export const useCompanyProfileForm = ({ initialData, onSave }: UseCompanyProfileFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      nome_oficina: initialData?.nome_oficina || '',
      telefone: initialData?.telefone || '',
      email: initialData?.email || '',
      endereco: initialData?.endereco || '',
      cidade: initialData?.cidade || '',
      estado: initialData?.estado || '',
      cep: initialData?.cep || '',
      cnpj: initialData?.cnpj || '',
      inscricao_estadual: initialData?.inscricao_estadual || '',
      observacoes_orcamento: initialData?.observacoes_orcamento || '',
      website: initialData?.website || '',
    }
  });
  
  const onSubmit = async (data: CompanyFormValues) => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Faça login novamente para continuar.",
        });
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id);
        
      if (error) throw error;
      
      onSave();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    isLoading,
    onSubmit
  };
};

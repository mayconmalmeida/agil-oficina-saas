import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useOficinaFilters } from '@/hooks/useOficinaFilters';

const fornecedorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

type FornecedorFormValues = z.infer<typeof fornecedorSchema>;

interface FornecedorFormProps {
  fornecedor?: any;
  onSave: () => void;
  onCancel: () => void;
}

const FornecedorForm: React.FC<FornecedorFormProps> = ({ fornecedor, onSave, onCancel }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const { oficina_id, user_id, isReady } = useOficinaFilters();

  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: fornecedor?.nome || '',
      cnpj: fornecedor?.cnpj || '',
      email: fornecedor?.email || '',
      telefone: fornecedor?.telefone || '',
      endereco: fornecedor?.endereco || '',
      cidade: fornecedor?.cidade || '',
      estado: fornecedor?.estado || '',
      cep: fornecedor?.cep || '',
    },
  });

  const onSubmit = async (values: FornecedorFormValues) => {
    if (!isReady) {
      toast({
        variant: "destructive",
        title: "Aguarde",
        description: "Carregando configurações..."
      });
      return;
    }

    if (!oficina_id || !user_id) {
      toast({
        variant: "destructive",
        title: "Erro de configuração",
        description: "Oficina não encontrada. Entre em contato com o suporte."
      });
      return;
    }

    setIsLoading(true);

    try {
      const fornecedorData = {
        nome: values.nome,
        cnpj: values.cnpj || null,
        email: values.email || null,
        telefone: values.telefone || null,
        endereco: values.endereco || null,
        cidade: values.cidade || null,
        estado: values.estado || null,
        cep: values.cep || null,
        user_id: user_id,
        oficina_id: oficina_id
      };

      if (fornecedor) {
        // Atualizar fornecedor existente
        const { error } = await supabase
          .from('fornecedores')
          .update(fornecedorData)
          .eq('id', fornecedor.id)
          .eq('oficina_id', oficina_id); // Garantir que só atualiza da própria oficina

        if (error) throw error;

        toast({
          title: "Fornecedor atualizado",
          description: "Fornecedor atualizado com sucesso!"
        });
      } else {
        // Criar novo fornecedor
        const { error } = await supabase
          .from('fornecedores')
          .insert([fornecedorData]);

        if (error) throw error;

        toast({
          title: "Fornecedor cadastrado",
          description: "Fornecedor cadastrado com sucesso!"
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({
        variant: "destructive",
        title: fornecedor ? "Erro ao atualizar fornecedor" : "Erro ao cadastrar fornecedor",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do fornecedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@fornecedor.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="SP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="00000-000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              fornecedor ? 'Atualizar' : 'Cadastrar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FornecedorForm;

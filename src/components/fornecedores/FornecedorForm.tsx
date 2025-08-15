
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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
  onSuccess: () => void;
  onCancel: () => void;
}

const FornecedorForm: React.FC<FornecedorFormProps> = ({ fornecedor, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const { oficina_id } = useOficinaFilters();

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Ensure nome is always included and not undefined
      const fornecedorData = {
        nome: values.nome, // Required field
        cnpj: values.cnpj || '',
        email: values.email || '',
        telefone: values.telefone || '',
        endereco: values.endereco || '',
        cidade: values.cidade || '',
        estado: values.estado || '',
        cep: values.cep || '',
        user_id: user.id,
        oficina_id: oficina_id,
      };

      if (fornecedor) {
        const { error } = await supabase
          .from('fornecedores')
          .update(fornecedorData)
          .eq('id', fornecedor.id);

        if (error) throw error;
        
        toast({
          title: "Fornecedor atualizado",
          description: "Fornecedor foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('fornecedores')
          .insert(fornecedorData);

        if (error) throw error;
        
        toast({
          title: "Fornecedor criado",
          description: "Fornecedor foi criado com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar fornecedor",
        description: error.message,
      });
    }
  };

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
                  <Input placeholder="email@fornecedor.com" type="email" {...field} />
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
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, bairro" {...field} />
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
                  <Input placeholder="UF" {...field} />
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

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {fornecedor ? 'Atualizar' : 'Criar'} Fornecedor
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FornecedorForm;

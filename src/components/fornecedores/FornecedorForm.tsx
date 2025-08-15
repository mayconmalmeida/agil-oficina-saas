
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
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar fornecedores."
        });
        return;
      }

      if (fornecedor) {
        // Atualizar fornecedor existente
        const { error } = await supabase
          .from('fornecedores')
          .update({
            nome: values.nome,
            cnpj: values.cnpj || null,
            email: values.email || null,
            telefone: values.telefone || null,
            endereco: values.endereco || null,
            cidade: values.cidade || null,
            estado: values.estado || null,
            cep: values.cep || null,
          })
          .eq('id', fornecedor.id);

        if (error) throw error;

        toast({
          title: "Fornecedor atualizado",
          description: "Fornecedor atualizado com sucesso!"
        });
      } else {
        // Criar novo fornecedor
        const { error } = await supabase
          .from('fornecedores')
          .insert({
            user_id: session.user.id,
            nome: values.nome,
            cnpj: values.cnpj || null,
            email: values.email || null,
            telefone: values.telefone || null,
            endereco: values.endereco || null,
            cidade: values.cidade || null,
            estado: values.estado || null,
            cep: values.cep || null,
          });

        if (error) throw error;

        toast({
          title: "Fornecedor cadastrado",
          description: "Fornecedor cadastrado com sucesso!"
        });
      }

      onSave();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: fornecedor ? "Erro ao atualizar fornecedor" : "Erro ao cadastrar fornecedor",
        description: error.message
      });
    } finally {
      setIsLoading(false);
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

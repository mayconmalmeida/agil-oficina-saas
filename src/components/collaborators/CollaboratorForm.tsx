
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const collaboratorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  funcao: z.string().min(1, 'Função é obrigatória'),
  permissoes: z.array(z.string()).default([])
});

type CollaboratorFormValues = z.infer<typeof collaboratorSchema>;

interface CollaboratorFormProps {
  onSuccess: () => void;
}

const permissaosList = [
  { id: 'clientes', label: 'Gerenciar Clientes' },
  { id: 'servicos', label: 'Gerenciar Serviços' },
  { id: 'orcamentos', label: 'Gerenciar Orçamentos' },
  { id: 'ordens_servico', label: 'Gerenciar Ordens de Serviço' },
  { id: 'financeiro', label: 'Módulo Financeiro' },
  { id: 'relatorios', label: 'Visualizar Relatórios' },
  { id: 'colaboradores', label: 'Gerenciar Colaboradores' }
];

const CollaboratorForm: React.FC<CollaboratorFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      funcao: '',
      permissoes: []
    }
  });

  const handleSubmit = async (values: CollaboratorFormValues) => {
    setIsLoading(true);
    try {
      console.log('Criando colaborador com dados:', values);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar ou criar oficina do usuário
      let { data: oficina, error: oficinaError } = await supabase
        .from('oficinas')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (oficinaError && oficinaError.code !== 'PGRST116') {
        throw oficinaError;
      }

      // Se não existe oficina, criar uma
      if (!oficina) {
        const { data: newOficina, error: createOficinaError } = await supabase
          .from('oficinas')
          .insert({
            user_id: user.id,
            nome_oficina: 'Minha Oficina',
            is_active: true,
            ativo: true
          })
          .select('id')
          .single();

        if (createOficinaError) throw createOficinaError;
        oficina = newOficina;
      }

      // Criar colaborador
      const { error } = await supabase
        .from('usuarios_colaboradores')
        .insert({
          user_id: user.id,
          oficina_id: oficina.id,
          nome: values.nome,
          email: values.email,
          telefone: values.telefone || null,
          funcao: values.funcao,
          permissoes: values.permissoes,
          ativo: true
        });

      if (error) {
        console.error('Erro ao criar colaborador:', error);
        throw error;
      }

      toast({
        title: "Colaborador criado",
        description: "O colaborador foi criado com sucesso.",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar colaborador:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar colaborador",
        description: error.message || 'Ocorreu um erro ao criar o colaborador.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
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
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
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
          name="funcao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="mecanico">Mecânico</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissoes"
          render={() => (
            <FormItem>
              <FormLabel>Permissões</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {permissaosList.map((permissao) => (
                  <FormField
                    key={permissao.id}
                    control={form.control}
                    name="permissoes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permissao.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permissao.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, permissao.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== permissao.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {permissao.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Criando...
            </>
          ) : (
            'Criar Colaborador'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CollaboratorForm;

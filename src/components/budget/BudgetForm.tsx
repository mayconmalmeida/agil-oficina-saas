
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const budgetSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor_total: z.number().min(0, 'Valor deve ser positivo'),
  data_validade: z.string().optional(),
  observacoes: z.string().optional()
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const BudgetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      valor_total: 0,
      data_validade: '',
      observacoes: ''
    }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message,
      });
    }
  };

  const handleSubmit = async (values: BudgetFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('orcamentos')
        .insert({
          user_id: user.id,
          cliente: values.cliente,
          veiculo: values.veiculo,
          descricao: values.descricao,
          valor_total: values.valor_total,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Orçamento criado",
        description: "O orçamento foi criado com sucesso.",
      });

      form.reset();
      // Redirect to budgets list
      window.location.href = '/orcamentos';
    } catch (error: any) {
      console.error('Erro ao criar orçamento:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar orçamento",
        description: error.message,
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
          name="cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.nome}>
                      {client.nome} - {client.telefone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="veiculo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veículo *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Honda Civic 2020" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva os serviços a serem realizados..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_validade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Validade</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais..."
                  {...field} 
                />
              </FormControl>
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
            'Criar Orçamento'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BudgetForm;

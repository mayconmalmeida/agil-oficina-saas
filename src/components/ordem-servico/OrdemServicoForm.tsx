
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeRpc } from '@/utils/supabaseTypes';

const ordemServicoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  orcamento_id: z.string().optional(),
  status: z.string().default('Aberta'),
  observacoes: z.string().optional(),
  criar_de_orcamento: z.boolean().default(false)
});

type OrdemServicoFormValues = z.infer<typeof ordemServicoSchema>;

interface OrdemServicoFormProps {
  onSuccess: () => void;
}

const OrdemServicoForm: React.FC<OrdemServicoFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [showOrcamentoSelect, setShowOrcamentoSelect] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrdemServicoFormValues>({
    resolver: zodResolver(ordemServicoSchema),
    defaultValues: {
      status: 'Aberta',
      criar_de_orcamento: false
    }
  });

  const fetchData = async () => {
    try {
      // Buscar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('nome');

      if (clientsError) throw clientsError;

      // Buscar orçamentos pendentes
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (orcamentosError) throw orcamentosError;

      setClients(clientsData || []);
      setOrcamentos(orcamentosData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values: OrdemServicoFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (values.orcamento_id) {
        // Criar OS a partir de orçamento usando a função RPC
        const { data, error } = await safeRpc('create_ordem_servico_from_orcamento', {
          p_user_id: user.id,
          p_orcamento_id: values.orcamento_id,
          p_observacoes: values.observacoes || null
        });

        if (error) throw error;
      } else {
        // Criar OS manual
        const { error } = await supabase
          .from('ordens_servico')
          .insert({
            user_id: user.id,
            cliente_id: values.cliente_id,
            status: values.status,
            observacoes: values.observacoes,
            valor_total: 0
          });

        if (error) throw error;
      }

      toast({
        title: "Ordem de serviço criada",
        description: "A ordem de serviço foi criada com sucesso.",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar OS:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ordem de serviço",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Ordem de Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="criar_de_orcamento"
                checked={showOrcamentoSelect}
                onChange={(e) => setShowOrcamentoSelect(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="criar_de_orcamento" className="text-sm font-medium">
                Criar a partir de orçamento existente
              </label>
            </div>

            {showOrcamentoSelect ? (
              <FormField
                control={form.control}
                name="orcamento_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orçamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um orçamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orcamentos.map((orcamento) => (
                          <SelectItem key={orcamento.id} value={orcamento.id}>
                            {orcamento.cliente} - {orcamento.descricao} (R$ {orcamento.valor_total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="cliente_id"
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
                          <SelectItem key={client.id} value={client.id}>
                            {client.nome} - {client.telefone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Aberta">Aberta</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Observações sobre a ordem de serviço..."
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
                'Criar Ordem de Serviço'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrdemServicoForm;


import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ordemServicoEditSchema = z.object({
  status: z.string().min(1, 'Status é obrigatório'),
  observacoes: z.string().optional(),
  valor_total: z.number().min(0, 'Valor deve ser positivo'),
  data_fim: z.string().optional()
});

type OrdemServicoEditValues = z.infer<typeof ordemServicoEditSchema>;

interface OrdemServico {
  id: string;
  cliente_id: string;
  orcamento_id?: string;
  status: string;
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
  valor_total: number;
  cliente_nome?: string;
  orcamento_descricao?: string;
}

interface OrdemServicoEditModalProps {
  ordem: OrdemServico | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OrdemServicoEditModal: React.FC<OrdemServicoEditModalProps> = ({
  ordem,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrdemServicoEditValues>({
    resolver: zodResolver(ordemServicoEditSchema),
    defaultValues: {
      status: 'Aberta',
      observacoes: '',
      valor_total: 0,
      data_fim: ''
    }
  });

  useEffect(() => {
    if (ordem) {
      form.reset({
        status: ordem.status,
        observacoes: ordem.observacoes || '',
        valor_total: ordem.valor_total,
        data_fim: ordem.data_fim ? new Date(ordem.data_fim).toISOString().split('T')[0] : ''
      });
    }
  }, [ordem, form]);

  const handleSubmit = async (values: OrdemServicoEditValues) => {
    if (!ordem) return;
    
    setIsLoading(true);
    try {
      const updateData: any = {
        status: values.status,
        observacoes: values.observacoes,
        valor_total: values.valor_total
      };

      if (values.data_fim) {
        updateData.data_fim = values.data_fim;
      }

      const { error } = await supabase
        .from('ordens_servico')
        .update(updateData)
        .eq('id', ordem.id);

      if (error) throw error;

      toast({
        title: "Ordem de serviço atualizada",
        description: "A ordem de serviço foi atualizada com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar OS:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar ordem de serviço",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!ordem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Editar Ordem de Serviço #{ordem.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Cliente:</label>
                <p className="text-lg bg-gray-50 p-2 rounded-md">{ordem.cliente_nome || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Data de Início:</label>
                <p className="text-lg bg-gray-50 p-2 rounded-md">
                  {new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

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
              name="valor_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total</FormLabel>
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
              name="data_fim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Finalização (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
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
                      placeholder="Observações sobre a ordem de serviço..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OrdemServicoEditModal;

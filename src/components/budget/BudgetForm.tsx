
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { budgetFormSchema, BudgetFormValues, SelectedItem } from './budgetSchema';
import { useToast } from '@/hooks/use-toast';

interface BudgetFormProps {
  onSubmit: (values: BudgetFormValues & { itens?: SelectedItem[] }) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<BudgetFormValues>;
  isEditing?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
  isEditing = false
}) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: initialData.cliente || '',
      veiculo: initialData.veiculo || '',
      descricao: initialData.descricao || '',
      valor_total: initialData.valor_total || 0,
      status: initialData.status || 'Pendente'
    }
  });

  // Calculate total value from selected items
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + item.valor_total, 0);
    form.setValue('valor_total', total);
  }, [selectedItems, form]);

  const handleSubmit = async (values: BudgetFormValues) => {
    try {
      await onSubmit({ ...values, itens: selectedItems });
      if (!isEditing) {
        form.reset();
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar orçamento"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                {...form.register('cliente')}
                placeholder="Nome do cliente"
              />
            </div>
            
            <div>
              <Label htmlFor="veiculo">Veículo</Label>
              <Input
                id="veiculo"
                {...form.register('veiculo')}
                placeholder="Modelo do veículo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...form.register('descricao')}
              placeholder="Descrição dos serviços/produtos"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_total">Valor Total</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                {...form.register('valor_total', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            {isEditing && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) => form.setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Orçamento')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BudgetForm;

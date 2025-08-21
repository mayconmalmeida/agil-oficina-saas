
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { BudgetFormValues, budgetSchema, SelectedItem } from './budgetSchema';
import ClientSearchField from './form-sections/ClientSearchField';
import VehicleField from './form-sections/VehicleField';
import ProductServiceSelector from './form-sections/ProductServiceSelector';
import { Client } from '@/hooks/useClientSearch';

interface BudgetFormProps {
  onSubmit?: (values: BudgetFormValues & { itens?: SelectedItem[] }) => Promise<void>;
  onSkip?: () => Promise<void>;
  isLoading?: boolean;
  initialValues?: Partial<BudgetFormValues>;
  isEditing?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ 
  onSubmit, 
  onSkip,
  isLoading = false, 
  initialValues = {},
  isEditing = false 
}) => {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const { toast } = useToast();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      cliente: initialValues.cliente || '',
      veiculo: initialValues.veiculo || '',
      descricao: initialValues.descricao || '',
      valor_total: initialValues.valor_total || 0,
      data_validade: initialValues.data_validade || '',
      observacoes: initialValues.observacoes || '',
      status: initialValues.status || 'Pendente'
    }
  });

  // Atualizar valor total automaticamente quando itens mudarem
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + (item.valor_total || 0), 0);
    form.setValue('valor_total', total);
  }, [selectedItems, form]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key) => {
        const value = initialValues[key as keyof BudgetFormValues];
        if (value !== undefined) {
          form.setValue(key as keyof BudgetFormValues, value);
        }
      });
    }
  }, [initialValues, form]);

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
    if (onSubmit) {
      await onSubmit({ ...values, itens: selectedItems });
    } else {
      // Default behavior if no onSubmit prop is provided
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
        setSelectedItems([]);
      } catch (error: any) {
        console.error('Erro ao criar orçamento:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar orçamento",
          description: error.message,
        });
      }
    }
  };

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
  };

  const handleItemsChange = (items: SelectedItem[]) => {
    setSelectedItems(items);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClientSearchField 
            form={form} 
            onClientSelect={handleClientSelect}
          />
          
          <VehicleField 
            form={form} 
            selectedClient={selectedClient}
          />
        </div>

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

        <ProductServiceSelector 
          selectedItems={selectedItems}
          onItemsChange={handleItemsChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    readOnly
                    className="bg-gray-50"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {isEditing ? 'Atualizando...' : 'Criando...'}
              </>
            ) : (
              isEditing ? 'Atualizar Orçamento' : 'Criar Orçamento'
            )}
          </Button>
          
          {onSkip && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onSkip}
              disabled={isLoading}
            >
              Pular
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default BudgetForm;

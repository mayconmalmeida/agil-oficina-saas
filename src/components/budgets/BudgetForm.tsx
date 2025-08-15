
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ClientSearchField from '@/components/budget/form-sections/ClientSearchField';
import ProductSelector from './ProductSelector';

const budgetSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição do serviço é obrigatória'),
  data_validade: z.string().optional(),
  valor_total: z.number().min(0, 'Valor total deve ser maior que zero'),
  observacoes: z.string().optional(),
  status: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

const BudgetForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      data_validade: '',
      valor_total: 0,
      observacoes: '',
    },
  });
  
  const updateTotalValue = (items: SelectedItem[]) => {
    const safeItems = Array.isArray(items) ? items : [];
    
    if (safeItems.length === 0) {
      form.setValue('valor_total', 0);
      return;
    }
    
    const total = safeItems.reduce((sum, item) => {
      const itemTotal = item?.valor_total || 0;
      return sum + itemTotal;
    }, 0);
    
    form.setValue('valor_total', total);
  };

  const handleItemsChange = (items: SelectedItem[]) => {
    setSelectedItems(items);
    updateTotalValue(items);
  };
  
  const handleSubmit = async (values: BudgetFormValues) => {
    setIsLoading(true);
    
    try {
      const formValues = {
        ...values,
        itens: selectedItems || []
      };
      
      console.log('Budget values:', formValues);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClientSearchField form={form} />
          
          <FormField
            control={form.control}
            name="veiculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo</FormLabel>
                <FormControl>
                  <Input placeholder="Marca, modelo e ano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Revisão completa com troca de óleo e filtros" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <ProductSelector 
          selectedItems={selectedItems}
          onItemsChange={handleItemsChange}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="data_validade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Validade (opcional)</FormLabel>
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
                    value={formatCurrency(field.value)} 
                    readOnly 
                    className="bg-gray-50 font-medium text-right" 
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
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o orçamento" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-oficina hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Salvando Orçamento...
              </>
            ) : (
              'Salvar Orçamento'
            )}
          </Button>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Mais ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="print">Imprimir Orçamento</SelectItem>
              <SelectItem value="email">Enviar por E-mail</SelectItem>
              <SelectItem value="whatsapp">Enviar via WhatsApp</SelectItem>
              <SelectItem value="convert">Converter em OS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Form>
  );
};

export default BudgetForm;

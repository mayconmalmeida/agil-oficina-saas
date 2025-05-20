
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ClientSearchField from '@/components/budget/form-sections/ClientSearchField';
import VehicleField from '@/components/budget/form-sections/VehicleField';
import DescriptionField from '@/components/budget/form-sections/DescriptionField';
import TotalValueField from '@/components/budget/form-sections/TotalValueField';
import ItemsSection, { BudgetItem } from './form-sections/ItemsSection';

const budgetSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  veiculo: z.string().min(1, 'Veículo é obrigatório'),
  descricao: z.string().min(1, 'Descrição do serviço é obrigatória'),
  data_validade: z.string().optional(),
  valor_total: z.string().min(1, 'Valor total é obrigatório'),
  observacoes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormRefactoredProps {
  initialValues?: Partial<BudgetFormValues>;
  isEditing?: boolean;
  budgetId?: string;
}

const BudgetFormRefactored: React.FC<BudgetFormRefactoredProps> = ({ 
  initialValues = {},
  isEditing = false,
  budgetId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<BudgetItem[]>([]);
  const { toast } = useToast();
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      cliente: initialValues.cliente || '',
      veiculo: initialValues.veiculo || '',
      descricao: initialValues.descricao || '',
      data_validade: initialValues.data_validade || '',
      valor_total: initialValues.valor_total || '0',
      observacoes: initialValues.observacoes || '',
    },
  });
  
  // Update total value when items change
  useEffect(() => {
    updateTotalValue(selectedItems);
  }, [selectedItems]);
  
  const handleSubmit = async (values: BudgetFormValues) => {
    setIsLoading(true);
    
    try {
      // Include selected items in the submission
      const formValues = {
        ...values,
        itens: selectedItems || []
      };
      
      console.log('Budget values:', formValues);
      
      // Here you would implement the API call to save the budget
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: isEditing ? "Orçamento atualizado" : "Orçamento criado",
        description: isEditing 
          ? "O orçamento foi atualizado com sucesso." 
          : "O orçamento foi criado com sucesso.",
      });
      
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} orçamento.`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTotalValue = (items: BudgetItem[]) => {
    if (!items || items.length === 0) {
      form.setValue('valor_total', '0');
      return;
    }
    
    const total = items.reduce((sum, item) => sum + (item.valor_total || 0), 0);
    form.setValue('valor_total', total.toFixed(2));
  };
  
  // Handle items change
  const handleItemsChange = (items: BudgetItem[]) => {
    setSelectedItems(items);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClientSearchField form={form} />
          <VehicleField form={form} />
        </div>
        
        <DescriptionField form={form} />
        
        <ItemsSection 
          items={selectedItems} 
          onItemsChange={handleItemsChange} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label htmlFor="data_validade" className="block text-sm font-medium text-gray-700 mb-1">Data de Validade (opcional)</label>
            <input 
              type="date" 
              id="data_validade"
              {...form.register('data_validade')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <TotalValueField form={form} />
        </div>
        
        <div className="form-control">
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
          <textarea 
            id="observacoes"
            {...form.register('observacoes')}
            placeholder="Informações adicionais sobre o orçamento"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-oficina hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {isEditing ? 'Atualizando Orçamento...' : 'Salvando Orçamento...'}
              </>
            ) : (
              isEditing ? 'Atualizar Orçamento' : 'Salvar Orçamento'
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
              {isEditing && <SelectItem value="convert">Converter em OS</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </form>
    </Form>
  );
};

export default BudgetFormRefactored;

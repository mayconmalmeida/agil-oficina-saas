
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, BudgetFormValues, SelectedItem } from './budgetSchema';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ClientSearchField from './form-sections/ClientSearchField';
import VehicleField from './form-sections/VehicleField';
import ServicesProductsSection from './form-sections/ServicesProductsSection';
import BudgetDetailsSection from './form-sections/BudgetDetailsSection';
import { Client } from '@/hooks/useClientSearch';

interface BudgetFormProps {
  onSubmit: (values: BudgetFormValues & { itens?: SelectedItem[] }) => Promise<void>;
  onSkip?: () => void;
  isLoading?: boolean;
  initialValues?: Partial<BudgetFormValues>;
  isEditing?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ 
  onSubmit, 
  onSkip, 
  isLoading = false,
  initialValues,
  isEditing = false
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      cliente: initialValues?.cliente || '',
      veiculo: initialValues?.veiculo || '',
      descricao: initialValues?.descricao || '',
      valor_total: initialValues?.valor_total || 0,
      data_validade: initialValues?.data_validade || '',
      observacoes: initialValues?.observacoes || '',
      status: initialValues?.status || 'Pendente',
    },
  });

  const handleFormSubmit = async (values: BudgetFormValues) => {
    const formData = {
      ...values,
      itens: selectedItems
    };
    await onSubmit(formData);
  };

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
  };

  const calculateTotal = () => {
    const total = selectedItems.reduce((sum, item) => sum + (item.valor_total || 0), 0);
    form.setValue('valor_total', total);
  };

  const handleItemsChange = (items: SelectedItem[]) => {
    setSelectedItems(items);
    calculateTotal();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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

        <ServicesProductsSection 
          selectedItems={selectedItems}
          onItemsChange={handleItemsChange}
        />

        <BudgetDetailsSection form={form} />

        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-oficina hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {isEditing ? 'Atualizando...' : 'Salvando Orçamento...'}
              </>
            ) : (
              isEditing ? 'Atualizar Orçamento' : 'Salvar Orçamento'
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


import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';
import { Form } from '@/components/ui/form';
import ClientSearchField from './form-sections/ClientSearchField';
import VehicleField from './form-sections/VehicleField';
import DescriptionField from './form-sections/DescriptionField';
import TotalValueField from './form-sections/TotalValueField';
import FormActions from './form-sections/FormActions';
import ProductServiceSelector from './form-sections/ProductServiceSelector';
import { useState, useEffect } from 'react';
import { Client } from '@/hooks/useClientSearch';

interface SelectedItem {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

interface BudgetFormProps {
  onSubmit: (data: BudgetFormValues & { itens?: SelectedItem[] }) => void;
  onSkip: () => void;
  isLoading: boolean;
  initialValues?: {
    cliente?: string;
    veiculo?: string;
    descricao?: string;
    valor_total?: string;
  }
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, onSkip, isLoading, initialValues }) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: initialValues?.cliente || '',
      veiculo: initialValues?.veiculo || '',
      descricao: initialValues?.descricao || '',
      valor_total: initialValues?.valor_total || ''
    }
  });

  // Update total value when items change
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + item.valor_total, 0);
    form.setValue('valor_total', total.toFixed(2));
  }, [selectedItems, form]);

  const handleSubmit = (values: BudgetFormValues) => {
    onSubmit({
      ...values,
      itens: selectedItems
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ClientSearchField 
          form={form} 
          onClientSelect={setSelectedClient}
        />
        <VehicleField 
          form={form} 
          selectedClient={selectedClient}
        />
        <DescriptionField form={form} />
        
        <ProductServiceSelector 
          selectedItems={selectedItems}
          onItemsChange={setSelectedItems}
        />
        
        <TotalValueField form={form} />
        <FormActions isLoading={isLoading} onSkip={onSkip} />
      </form>
    </Form>
  );
};

export default BudgetForm;


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
import XmlUploadField from './form-sections/XmlUploadField';
import { useState, useEffect } from 'react';

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

  const handleProductsImported = (products: any[]) => {
    // Convert imported products to selected items format
    const importedItems: SelectedItem[] = products.map((product, index) => ({
      id: `imported-${index}`,
      nome: product.nome,
      tipo: 'produto' as const,
      quantidade: product.quantidade || 1,
      valor_unitario: product.preco_unitario || 0,
      valor_total: (product.quantidade || 1) * (product.preco_unitario || 0)
    }));

    // Add to existing selected items
    setSelectedItems(prev => [...prev, ...importedItems]);
  };

  const handleSupplierImported = (supplier: any) => {
    // You can handle supplier data here if needed
    console.log('Fornecedor importado:', supplier);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ClientSearchField form={form} />
        <VehicleField form={form} />
        <DescriptionField form={form} />
        
        <XmlUploadField 
          onProductsImported={handleProductsImported}
          onSupplierImported={handleSupplierImported}
        />
        
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

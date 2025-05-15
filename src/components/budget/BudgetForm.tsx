
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';
import { useClientSearch } from '@/hooks/useClientSearch';
import ClientSearchField from './form-sections/ClientSearchField';
import VehicleField from './form-sections/VehicleField';
import DescriptionField from './form-sections/DescriptionField';
import TotalValueField from './form-sections/TotalValueField';
import FormActions from './form-sections/FormActions';

interface BudgetFormProps {
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, onSkip, isLoading }) => {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      valor_total: '',
    },
  });

  // Reset search when form is reset
  const { clearSelection } = useClientSearch();
  
  useEffect(() => {
    const subscription = form.watch(() => {
      if (!form.getValues('cliente')) {
        clearSelection();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, clearSelection]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ClientSearchField form={form} />
        <VehicleField form={form} />
        <DescriptionField form={form} />
        <TotalValueField form={form} />
        <FormActions isLoading={isLoading} onSkip={onSkip} />
      </form>
    </Form>
  );
};

export default BudgetForm;

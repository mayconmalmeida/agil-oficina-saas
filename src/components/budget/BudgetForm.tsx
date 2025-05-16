
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';
import { Form } from '@/components/ui/form';
import ClientSearchField from './form-sections/ClientSearchField';
import VehicleField from './form-sections/VehicleField';
import DescriptionField from './form-sections/DescriptionField';
import TotalValueField from './form-sections/TotalValueField';
import FormActions from './form-sections/FormActions';

interface BudgetFormProps {
  onSubmit: (data: BudgetFormValues) => void;
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
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: initialValues?.cliente || '',
      veiculo: initialValues?.veiculo || '',
      descricao: initialValues?.descricao || '',
      valor_total: initialValues?.valor_total || ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';
import { useBudgetForm } from '@/hooks/useBudgetForm';
import ClientField from './form-sections/ClientField';
import VehicleField from './form-sections/VehicleField';
import DescriptionField from './form-sections/DescriptionField';
import ValueField from './form-sections/ValueField';
import ServicesField from './form-sections/ServicesField';

const BudgetForm: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const { isLoading, handleSubmit: handleBudgetSubmit, skipStep } = useBudgetForm();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      valor_total: ''
    },
  });

  const handleClientChange = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    form.setValue('cliente', clientName);
  };

  const onSubmit = async (values: BudgetFormValues) => {
    await handleBudgetSubmit(values);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ClientField 
                form={form} 
                onClientChange={handleClientChange}
              />
              
              <VehicleField 
                form={form}
              />
              
              <DescriptionField form={form} />
              
              <ServicesField form={form} />
              
              <ValueField form={form} />
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-oficina hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Orçamento'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={skipStep}
                  disabled={isLoading}
                >
                  Pular esta etapa
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetForm;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetForm from '@/components/budget/BudgetForm';
import BudgetPageHeader from '@/components/budget/BudgetPageHeader';
import { useBudgetForm } from '@/hooks/useBudgetForm';
import Loading from '@/components/ui/loading';

const NewBudgetPage: React.FC = () => {
  const { isLoading, handleSubmit, skipStep, userId } = useBudgetForm();
  
  if (userId === undefined) {
    return <Loading fullscreen text="Verificando credenciais..." />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <BudgetPageHeader 
          title="Novo Orçamento" 
          subtitle="Registre um orçamento para seu cliente" 
        />
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Dados do Orçamento</CardTitle>
            <CardDescription>
              Informe os detalhes do serviço a ser realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm 
              onSubmit={handleSubmit}
              onSkip={skipStep}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBudgetPage;

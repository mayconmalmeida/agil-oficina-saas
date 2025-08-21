
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BudgetForm from '@/components/budget/BudgetForm';

const NewBudgetPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Novo Orçamento</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Criar Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBudgetPage;

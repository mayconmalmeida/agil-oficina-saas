
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BudgetForm from '@/components/budget/BudgetForm';

const NewBudgetPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/orcamentos')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Novo Orçamento</h1>
        </div>
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

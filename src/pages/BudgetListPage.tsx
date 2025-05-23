
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const BudgetListPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Lista de Orçamentos</h1>
        <p>Aqui você pode visualizar todos os seus orçamentos.</p>
      </div>
    </DashboardLayout>
  );
};

export default BudgetListPage;

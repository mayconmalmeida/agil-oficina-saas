
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';

const EditBudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Editar Orçamento</h1>
        <p>Editando orçamento com ID: {id}</p>
      </div>
    </DashboardLayout>
  );
};

export default EditBudgetPage;

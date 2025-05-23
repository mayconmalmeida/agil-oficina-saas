
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const NewServicePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Novo Serviço</h1>
        <p>Formulário para criar um novo serviço.</p>
      </div>
    </DashboardLayout>
  );
};

export default NewServicePage;

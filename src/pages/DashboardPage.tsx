
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Bem-vindo ao seu painel de controle da OficinaÁgil!</p>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;


import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const AppointmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Agendamentos</h1>
        <p>Gerencie todos os seus agendamentos de serviços.</p>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;

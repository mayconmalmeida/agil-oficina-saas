
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleForm from '@/components/vehicles/VehicleForm';
import SubscriptionGuard from '@/components/subscription/SubscriptionGuard';
import DiagnosticoIA from '@/components/ai/DiagnosticoIA';
import SuporteIA from '@/components/ai/SuporteIA';

const VehicleRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    // Navigate back to vehicles list after successful save
    navigate('/veiculos');
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Cadastro de Veículo
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Registre um novo veículo no sistema
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Formulário principal */}
            <div className="xl:col-span-2">
              <VehicleForm onSave={handleSave} />
            </div>
            
            {/* Sidebar com funcionalidades de IA */}
            <div className="space-y-6">
              <DiagnosticoIA />
              <SuporteIA />
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default VehicleRegistrationPage;

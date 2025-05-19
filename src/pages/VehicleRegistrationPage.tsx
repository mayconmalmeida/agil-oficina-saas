
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VehicleForm from '@/components/vehicles/VehicleForm';

const VehicleRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();
  const { vehicleId } = useParams<{ vehicleId?: string }>();
  const isEditing = !!vehicleId;
  
  const handleSaved = () => {
    // Navigate back to vehicles list after a short delay
    setTimeout(() => {
      navigate('/veiculos');
    }, 1500);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/veiculos')}>
          Voltar
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Veículo</CardTitle>
          <CardDescription>
            Preencha os dados do veículo a ser cadastrado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleForm 
            onSaved={handleSaved}
            vehicleId={vehicleId}
            isEditing={isEditing}
            clientId={clientId}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleRegistrationPage;

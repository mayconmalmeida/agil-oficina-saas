
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import VehicleForm from '@/components/vehicles/VehicleForm';

const VehicleRegistrationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId?: string }>();
  const { vehicleId } = useParams<{ vehicleId?: string }>();
  
  const handleSaved = () => {
    // Navigate back to vehicles list after a short delay
    setTimeout(() => {
      navigate('/veiculos');
    }, 1500);
  };
  
  if (isLoading) {
    return <Loading text="Carregando..." />;
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {vehicleId ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
        </h1>
        <Button variant="outline" onClick={() => navigate('/veiculos')}>
          Voltar
        </Button>
      </div>
      
      <Card className="bg-white">
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
            isEditing={!!vehicleId}
            clientId={clientId}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleRegistrationPage;

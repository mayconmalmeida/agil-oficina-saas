
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleForm from '@/components/vehicles/VehicleForm';

const NewVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const handleSave = () => {
    navigate('/dashboard/veiculos');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Veículo' : 'Cadastrar Veículo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm 
            onSave={handleSave}
            isEditing={isEditing}
            vehicleId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewVehiclePage;

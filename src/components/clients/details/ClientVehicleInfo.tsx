
import React from 'react';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ClientVehicleInfoProps {
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  onCreateBudget: () => void;
}

const ClientVehicleInfo: React.FC<ClientVehicleInfoProps> = ({ 
  marca, modelo, ano, placa, onCreateBudget 
}) => {
  if (!marca && !modelo && !placa) return null;
  
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Veículo</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCreateBudget}
            className="h-7 text-xs"
          >
            Orçar
          </Button>
        </div>
        
        <div className="flex items-start gap-2 text-sm">
          <Car className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p>{marca} {modelo} {ano && `(${ano})`}</p>
            {placa && <p className="text-gray-500">Placa: {placa}</p>}
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
};

export default ClientVehicleInfo;

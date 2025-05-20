
import React from 'react';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface ClientVehicleInfoProps {
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  veiculo?: string;
  cor?: string;
  kilometragem?: string;
  clienteId?: string;
  clienteNome?: string;
  onCreateBudget?: () => void;
}

const ClientVehicleInfo: React.FC<ClientVehicleInfoProps> = ({ 
  marca, modelo, ano, placa, veiculo, cor, kilometragem, clienteId, clienteNome, onCreateBudget 
}) => {
  const navigate = useNavigate();
  
  if (!marca && !modelo && !placa && !veiculo) return null;
  
  // Format the vehicle display text
  const vehicleDisplay = veiculo || `${marca || ''} ${modelo || ''} ${ano ? `(${ano})` : ''}`.trim();
  
  // Handle budget creation
  const handleCreateBudget = () => {
    if (onCreateBudget) {
      onCreateBudget();
    } else if (clienteId) {
      // Navigate to new budget page with client and vehicle info
      const params = new URLSearchParams();
      if (clienteId) params.append('clienteId', clienteId);
      if (clienteNome) params.append('clienteNome', clienteNome);
      if (vehicleDisplay) params.append('veiculo', vehicleDisplay);
      
      navigate(`/orcamentos/novo?${params.toString()}`);
    }
  };
  
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Veículo</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCreateBudget}
            className="h-7 text-xs"
          >
            Orçar
          </Button>
        </div>
        
        <div className="flex items-start gap-2 text-sm">
          <Car className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p>{vehicleDisplay}</p>
            {placa && <p className="text-gray-500">Placa: {placa}</p>}
            {cor && <p className="text-gray-500">Cor: {cor}</p>}
            {kilometragem && <p className="text-gray-500">Kilometragem: {kilometragem}</p>}
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
};

export default ClientVehicleInfo;

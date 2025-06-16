
import React from 'react';
import { Car, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  kilometragem?: string;
  tipo_combustivel?: string;
}

interface ClientVehicleInfoProps {
  vehicles?: Vehicle[];
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  veiculo?: string;
  cor?: string;
  kilometragem?: string;
  onCreateBudget?: () => void;
}

const ClientVehicleInfo: React.FC<ClientVehicleInfoProps> = ({ 
  vehicles = [],
  marca, 
  modelo, 
  ano, 
  placa, 
  veiculo, 
  cor, 
  kilometragem, 
  onCreateBudget 
}) => {
  const navigate = useNavigate();

  // Se não há veículos na nova tabela, use os dados legados do cliente
  const hasNewVehicles = vehicles && vehicles.length > 0;
  const hasLegacyVehicle = (marca && modelo) || veiculo;

  if (!hasNewVehicles && !hasLegacyVehicle) {
    return (
      <>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Veículos</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/veiculos/novo')}
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Cadastrar
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Car className="h-4 w-4" />
            <p>Nenhum veículo cadastrado</p>
          </div>
        </div>
        <Separator />
      </>
    );
  }
  
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Veículos</h3>
          <div className="flex gap-2">
            {onCreateBudget && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onCreateBudget}
                className="h-7 text-xs"
              >
                Orçar
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/veiculos/novo')}
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Novo
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Exibir veículos da nova tabela */}
          {hasNewVehicles && vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-start gap-2 text-sm border-l-2 border-blue-200 pl-3">
              <Car className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{vehicle.marca} {vehicle.modelo} ({vehicle.ano})</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{vehicle.placa}</Badge>
                  {vehicle.cor && <span className="text-gray-500 text-xs">Cor: {vehicle.cor}</span>}
                  {vehicle.kilometragem && <span className="text-gray-500 text-xs">KM: {vehicle.kilometragem}</span>}
                  {vehicle.tipo_combustivel && <span className="text-gray-500 text-xs">{vehicle.tipo_combustivel}</span>}
                </div>
              </div>
            </div>
          ))}

          {/* Exibir dados legados se não houver veículos na nova tabela */}
          {!hasNewVehicles && hasLegacyVehicle && (
            <div className="flex items-start gap-2 text-sm border-l-2 border-orange-200 pl-3">
              <Car className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                {veiculo ? (
                  <p>{veiculo}</p>
                ) : (
                  <p>{marca} {modelo} {ano && `(${ano})`}</p>
                )}
                {placa && <p className="text-gray-500">Placa: {placa}</p>}
                {cor && <p className="text-gray-500">Cor: {cor}</p>}
                {kilometragem && <p className="text-gray-500">Kilometragem: {kilometragem}</p>}
                <Badge variant="secondary" className="text-xs mt-1">Dados legados</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
      <Separator />
    </>
  );
};

export default ClientVehicleInfo;

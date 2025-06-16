
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

  // Função para formatar informações de forma mais limpa
  const formatVehicleDisplay = (vehicleData: any) => {
    // Para dados da nova estrutura
    if (vehicleData.marca && vehicleData.modelo) {
      return {
        mainInfo: `${vehicleData.marca} ${vehicleData.modelo}`,
        year: vehicleData.ano || '',
        plate: vehicleData.placa || 'Não informado',
        color: vehicleData.cor || '',
        mileage: vehicleData.kilometragem || '',
        fuel: vehicleData.tipo_combustivel || ''
      };
    }
    
    // Para dados legados do campo veiculo
    if (vehicleData.veiculo) {
      const parts = vehicleData.veiculo.split(',');
      const mainPart = parts[0]?.trim() || '';
      const platePart = parts.find(part => part.includes('Placa:'))?.replace('Placa:', '').trim();
      
      return {
        mainInfo: mainPart,
        year: '',
        plate: platePart || vehicleData.placa || 'Não informado',
        color: vehicleData.cor || '',
        mileage: vehicleData.kilometragem || '',
        fuel: ''
      };
    }
    
    // Para dados legados separados
    if (vehicleData.marca || vehicleData.modelo) {
      return {
        mainInfo: `${vehicleData.marca || ''} ${vehicleData.modelo || ''}`.trim(),
        year: vehicleData.ano || '',
        plate: vehicleData.placa || 'Não informado',
        color: vehicleData.cor || '',
        mileage: vehicleData.kilometragem || '',
        fuel: ''
      };
    }
    
    return null;
  };

  if (!hasNewVehicles && !hasLegacyVehicle) {
    return (
      <>
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">Veículos</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/veiculos/novo')}
              className="h-8 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Cadastrar
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <Car className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Nenhum veículo cadastrado</p>
            <p className="text-xs text-gray-400 mt-1">Cadastre um veículo para começar</p>
          </div>
        </div>
        <Separator />
      </>
    );
  }
  
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900">Veículos</h3>
          <div className="flex gap-2">
            {onCreateBudget && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onCreateBudget}
                className="h-8 text-xs"
              >
                Orçar
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/veiculos/novo')}
              className="h-8 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Novo
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Exibir veículos da nova tabela */}
          {hasNewVehicles && vehicles.map((vehicle) => {
            const vehicleInfo = formatVehicleDisplay(vehicle);
            if (!vehicleInfo) return null;
            
            return (
              <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-blue-50 rounded-full">
                    <Car className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {vehicleInfo.mainInfo || 'Veículo não identificado'}
                      </h4>
                      {vehicleInfo.year && (
                        <Badge variant="outline" className="text-xs">
                          {vehicleInfo.year}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Placa:</span>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {vehicleInfo.plate}
                        </Badge>
                      </div>
                      
                      {vehicleInfo.color && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Cor:</span>
                          <span className="text-xs text-gray-700">{vehicleInfo.color}</span>
                        </div>
                      )}
                      
                      {vehicleInfo.mileage && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Km:</span>
                          <span className="text-xs text-gray-700">{vehicleInfo.mileage}</span>
                        </div>
                      )}
                      
                      {vehicleInfo.fuel && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Combustível:</span>
                          <span className="text-xs text-gray-700">{vehicleInfo.fuel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Exibir dados legados se não houver veículos na nova tabela */}
          {!hasNewVehicles && hasLegacyVehicle && (() => {
            const legacyVehicleInfo = formatVehicleDisplay({ marca, modelo, ano, placa, veiculo, cor, kilometragem });
            if (!legacyVehicleInfo) return null;
            
            return (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-orange-100 rounded-full">
                    <Car className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {legacyVehicleInfo.mainInfo || 'Veículo não identificado'}
                      </h4>
                      {legacyVehicleInfo.year && (
                        <Badge variant="outline" className="text-xs">
                          {legacyVehicleInfo.year}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Dados legados
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Placa:</span>
                        <Badge variant="secondary" className="text-xs font-mono">
                          {legacyVehicleInfo.plate}
                        </Badge>
                      </div>
                      
                      {legacyVehicleInfo.color && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Cor:</span>
                          <span className="text-xs text-gray-700">{legacyVehicleInfo.color}</span>
                        </div>
                      )}
                      
                      {legacyVehicleInfo.mileage && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Km:</span>
                          <span className="text-xs text-gray-700">{legacyVehicleInfo.mileage}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-orange-600 mt-2">
                      💡 Considere migrar este veículo para o novo formato
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      <Separator />
    </>
  );
};

export default ClientVehicleInfo;

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Car, History } from 'lucide-react';
import ClientForm from './ClientForm';
import { VehicleFormSection } from './VehicleFormSection';
import { VehicleHistoryTab } from '../vehicles/VehicleHistoryTab';

interface ClientEditDialogTabsProps {
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ClientEditDialogTabs: React.FC<ClientEditDialogTabsProps> = ({
  clientId,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('dados');
  const [selectedVehicle, setSelectedVehicle] = useState<{id: string, placa: string, info: string} | null>(null);

  const handleVehicleSelect = (vehicleId: string, placa: string, info: string) => {
    setSelectedVehicle({ id: vehicleId, placa, info });
    setActiveTab('historico');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="veiculos" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Veículos
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2" disabled={!selectedVehicle}>
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="dados" className="space-y-4">
              <ClientForm 
                onSave={onSave}
                isEditing={true}
                clientId={clientId}
              />
            </TabsContent>
            
            <TabsContent value="veiculos" className="space-y-4">
              <VehicleFormSection 
                clientId={clientId} 
                onVehicleSelect={handleVehicleSelect}
              />
            </TabsContent>

            <TabsContent value="historico" className="space-y-4">
              {selectedVehicle && (
                <VehicleHistoryTab
                  clientId={clientId}
                  vehicleId={selectedVehicle.id}
                  vehiclePlate={selectedVehicle.placa}
                  vehicleInfo={selectedVehicle.info}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
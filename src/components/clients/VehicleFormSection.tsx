import React, { useState, useEffect } from 'react';
import { Plus, Car, Edit, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VehicleForm from '../vehicles/VehicleForm';
import { useClientVehicles } from '@/hooks/useClientVehicles';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface VehicleFormSectionProps {
  clientId: string;
  onVehicleSelect?: (vehicleId: string, placa: string, info: string) => void;
}

export const VehicleFormSection: React.FC<VehicleFormSectionProps> = ({ 
  clientId, 
  onVehicleSelect 
}) => {
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const { vehicles, isLoading, refetch } = useClientVehicles(clientId);
  const { toast } = useToast();

  const handleEdit = (vehicleId: string) => {
    setEditingVehicle(vehicleId);
    setShowVehicleForm(true);
  };

  const handleCloseForm = () => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
    refetch();
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Veículo excluído com sucesso.",
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao excluir veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir veículo",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Veículos do Cliente</h3>
        <Button onClick={() => setShowVehicleForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Veículo
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum veículo cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Este cliente ainda não possui veículos cadastrados.
            </p>
            <Button onClick={() => setShowVehicleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Veículo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placa: {vehicle.placa}
                      {vehicle.cor && ` • Cor: ${vehicle.cor}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicle.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onVehicleSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVehicleSelect(vehicle.id, vehicle.placa, `${vehicle.marca} ${vehicle.modelo}`)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {showVehicleForm && (
        <VehicleForm
          clientId={clientId}
          vehicleId={editingVehicle || undefined}
          isEditing={!!editingVehicle}
          onSave={handleCloseForm}
        />
      )}
    </div>
  );
};
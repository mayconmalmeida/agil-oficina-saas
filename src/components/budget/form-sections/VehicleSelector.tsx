
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { supabase } from '@/lib/supabase';
import { Car, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  kilometragem?: string;
}

interface VehicleSelectorProps {
  form: UseFormReturn<BudgetFormValues>;
  clientId?: string;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ form, clientId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingKm, setEditingKm] = useState(false);
  const [newKm, setNewKm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (clientId) {
      loadClientVehicles();
    }
  }, [clientId]);

  const loadClientVehicles = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatVehicleDisplay = (vehicle: Vehicle) => {
    const kmText = vehicle.kilometragem ? ` - ${vehicle.kilometragem} km` : '';
    const corText = vehicle.cor ? ` - ${vehicle.cor}` : '';
    return `${vehicle.marca} ${vehicle.modelo} (${vehicle.ano}) - ${vehicle.placa}${corText}${kmText}`;
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const selected = vehicles.find(v => v.id === vehicleId);
    if (selected) {
      setSelectedVehicle(selected);
      const vehicleInfo = formatVehicleDisplay(selected);
      form.setValue('veiculo', vehicleInfo);
      setNewKm(selected.kilometragem || '');
    }
  };

  const handleUpdateKilometragem = async () => {
    if (!selectedVehicle || !newKm) return;

    try {
      const { error } = await supabase
        .from('veiculos')
        .update({ kilometragem: newKm })
        .eq('id', selectedVehicle.id);

      if (error) throw error;

      // Update local state
      const updatedVehicle = { ...selectedVehicle, kilometragem: newKm };
      setSelectedVehicle(updatedVehicle);
      setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? updatedVehicle : v));
      
      // Update form value
      const vehicleInfo = formatVehicleDisplay(updatedVehicle);
      form.setValue('veiculo', vehicleInfo);
      
      setEditingKm(false);
      
      toast({
        title: "Quilometragem atualizada",
        description: `Quilometragem do veículo atualizada para ${newKm} km.`,
      });
    } catch (error) {
      console.error('Error updating vehicle kilometragem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a quilometragem do veículo.",
      });
    }
  };

  const cancelEdit = () => {
    setEditingKm(false);
    setNewKm(selectedVehicle?.kilometragem || '');
  };

  if (!clientId) {
    return (
      <FormField
        control={form.control}
        name="veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Informações do Veículo</FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="Selecione um cliente primeiro"
                className="bg-gray-100"
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecionar Veículo</FormLabel>
            <Select onValueChange={handleVehicleSelect} disabled={loading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando veículos..." : "Selecione um veículo"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <SelectItem value="no-vehicles" disabled>
                    Nenhum veículo cadastrado
                  </SelectItem>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>{formatVehicleDisplay(vehicle)}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedVehicle && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">Veículo Selecionado</h4>
            {!editingKm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingKm(true)}
                className="text-blue-700 hover:text-blue-900"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar KM
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              <strong>Veículo:</strong> {selectedVehicle.marca} {selectedVehicle.modelo} ({selectedVehicle.ano})
            </p>
            <p className="text-sm text-blue-700">
              <strong>Placa:</strong> {selectedVehicle.placa}
            </p>
            {selectedVehicle.cor && (
              <p className="text-sm text-blue-700">
                <strong>Cor:</strong> {selectedVehicle.cor}
              </p>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700 font-medium">Quilometragem:</span>
              {editingKm ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={newKm}
                    onChange={(e) => setNewKm(e.target.value)}
                    placeholder="Ex: 150000"
                    className="w-32 h-8"
                  />
                  <span className="text-sm text-blue-700">km</span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpdateKilometragem}
                    className="h-8 px-2"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                    className="h-8 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-blue-700">
                  {selectedVehicle.kilometragem || 'Não informada'} km
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;

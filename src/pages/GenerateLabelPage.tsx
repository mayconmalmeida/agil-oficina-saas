import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useClientVehicles } from '@/hooks/useClientVehicles';
import { QrCode, Car, User } from 'lucide-react';
import { OilChangeLabel } from '@/components/vehicles/OilChangeLabel';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
}

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
}

const GenerateLabelPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState<Vehicle | null>(null);

  const { vehicles, isLoading: isLoadingVehicles } = useClientVehicles(selectedClientId);

  useEffect(() => {
    if (user?.id) {
      fetchClients();
    }
  }, [user?.id]);

  const fetchClients = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, telefone, email')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedVehicleId('');
    setSelectedVehicleData(null);
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setSelectedVehicleData(vehicle || null);
  };

  const handleGenerateLabel = () => {
    if (!selectedClientId || !selectedVehicleId) {
      toast({
        variant: "destructive",
        title: "Seleção obrigatória",
        description: "Selecione um cliente e um veículo para gerar a etiqueta.",
      });
      return;
    }

    setShowLabelModal(true);
  };

  const handleLabelClose = () => {
    setShowLabelModal(false);
  };

  const handleLabelSuccess = () => {
    setShowLabelModal(false);
    toast({
      title: "Etiqueta gerada com sucesso!",
      description: "A etiqueta foi gerada e está pronta para impressão.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Gerar Etiqueta
          </CardTitle>
          <p className="text-muted-foreground">
            Selecione o cliente e veículo para gerar a etiqueta com QR Code
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção do Cliente */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Cliente
            </label>
            <Select value={selectedClientId} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nome} - {client.telefone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção do Veículo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Car className="h-4 w-4" />
              Veículo
            </label>
            <Select 
              value={selectedVehicleId} 
              onValueChange={handleVehicleChange}
              disabled={!selectedClientId || isLoadingVehicles}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    !selectedClientId 
                      ? "Primeiro selecione um cliente" 
                      : isLoadingVehicles 
                        ? "Carregando veículos..." 
                        : "Selecione um veículo"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.marca} {vehicle.modelo} ({vehicle.ano})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Gerar */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleGenerateLabel}
              disabled={!selectedClientId || !selectedVehicleId}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Gerar Etiqueta
            </Button>
          </div>

          {/* Preview dos dados selecionados */}
          {selectedClientId && selectedVehicleData && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Dados Selecionados:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Cliente:</strong> {clients.find(c => c.id === selectedClientId)?.nome}</p>
                <p><strong>Veículo:</strong> {selectedVehicleData.placa} - {selectedVehicleData.marca} {selectedVehicleData.modelo} ({selectedVehicleData.ano})</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal da Etiqueta */}
      {showLabelModal && selectedClientId && selectedVehicleId && selectedVehicleData && (
        <OilChangeLabel
          clientId={selectedClientId}
          vehicleId={selectedVehicleId}
          vehiclePlate={selectedVehicleData.placa}
          vehicleInfo={`${selectedVehicleData.marca} ${selectedVehicleData.modelo} ${selectedVehicleData.ano}`}
          onClose={handleLabelClose}
          onSuccess={handleLabelSuccess}
        />
      )}
    </div>
  );
};

export default GenerateLabelPage;

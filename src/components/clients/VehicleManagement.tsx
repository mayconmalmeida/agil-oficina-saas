import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import VehicleForm from './VehicleForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor?: string;
  kilometragem?: string;
  tipo_combustivel?: string;
  created_at: string;
}

interface VehicleManagementProps {
  clientId: string;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ clientId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchVehicles();
  }, [clientId]);

  const fetchVehicles = async () => {
    if (!clientId || !user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar veículos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os veículos do cliente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', vehicleId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setVehicles(vehicles.filter(v => v.id !== vehicleId));
      toast({
        title: "Veículo excluído",
        description: "O veículo foi removido com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao excluir veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o veículo."
      });
    }
  };

  const handleVehicleSaved = () => {
    fetchVehicles();
    setIsDialogOpen(false);
    setEditingVehicle(null);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingVehicle(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Veículos Cadastrados</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle 
                  ? 'Edite as informações do veículo'
                  : 'Adicione um novo veículo para este cliente'
                }
              </DialogDescription>
            </DialogHeader>
            <VehicleForm
              clientId={clientId}
              vehicle={editingVehicle}
              onSave={handleVehicleSaved}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum veículo cadastrado para este cliente.
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Veículo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Kilometragem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      {vehicle.marca} {vehicle.modelo}
                    </TableCell>
                    <TableCell>{vehicle.ano}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.placa}</Badge>
                    </TableCell>
                    <TableCell>{vehicle.cor || '-'}</TableCell>
                    <TableCell>{vehicle.kilometragem || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(vehicle)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleManagement;
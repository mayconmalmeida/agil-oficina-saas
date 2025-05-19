
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Car, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import Loading from '@/components/ui/loading';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Vehicle {
  id: string;
  cliente_nome: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
}

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchVehicles();
  }, []);
  
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      
      // For now, we're getting the vehicle information from the clients table
      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, placa, marca, modelo, ano')
        .not('placa', 'is', null);
        
      if (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar veículos",
          description: "Não foi possível carregar a lista de veículos.",
        });
        setVehicles([]);
        return;
      }
      
      if (!data) {
        setVehicles([]);
        return;
      }
      
      // Transform the data to match our Vehicle interface
      const vehicleData = data.map(client => ({
        id: client.id,
        cliente_nome: client.nome,
        placa: client.placa || 'N/A',
        marca: client.marca || 'N/A',
        modelo: client.modelo || 'N/A',
        ano: client.ano || 'N/A'
      }));
      
      setVehicles(vehicleData);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar veículos",
        description: "Não foi possível carregar a lista de veículos.",
      });
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditVehicle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/veiculos/editar/${id}`);
  };
  
  const confirmDeleteVehicle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    setDeleteVehicleId(id);
  };
  
  const handleDeleteVehicle = async () => {
    if (!deleteVehicleId) return;
    
    try {
      // We're not actually deleting the client, just clearing vehicle info
      const { error } = await supabase
        .from('clients')
        .update({
          placa: null,
          marca: null,
          modelo: null,
          ano: null,
          cor: null,
          kilometragem: null,
          veiculo: null
        })
        .eq('id', deleteVehicleId);
      
      if (error) throw error;
      
      // Remove the vehicle from our local state
      setVehicles(vehicles.filter(vehicle => vehicle.id !== deleteVehicleId));
      
      toast({
        title: "Veículo removido",
        description: "O veículo foi removido com sucesso.",
      });
      
    } catch (error: any) {
      console.error('Error removing vehicle:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover veículo",
        description: error.message || "Não foi possível remover o veículo.",
      });
    } finally {
      setDeleteVehicleId(null);
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteVehicleId(null);
  };
  
  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Veículos</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar veículo..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/veiculos/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          {filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum veículo encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando um novo veículo'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => navigate('/veiculos/novo')} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Veículo
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow 
                    key={`${vehicle.id}-${vehicle.placa}`}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/veiculos/${vehicle.id}`)}
                  >
                    <TableCell className="font-medium">{vehicle.placa}</TableCell>
                    <TableCell>{vehicle.marca}</TableCell>
                    <TableCell>{vehicle.modelo}</TableCell>
                    <TableCell>{vehicle.ano}</TableCell>
                    <TableCell>{vehicle.cliente_nome}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => handleEditVehicle(vehicle.id, e)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => confirmDeleteVehicle(vehicle.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteVehicleId} onOpenChange={() => setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVehicle}
              className="bg-red-500 hover:bg-red-600"
            >
              Remover Veículo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehiclesPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Car, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  kilometragem?: string;
  tipo_combustivel?: string;
  created_at: string;
  cliente: {
    id: string;
    nome: string;
    telefone: string;
  };
}

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('veiculos')
        .select(`
          id,
          placa,
          marca,
          modelo,
          ano,
          cor,
          kilometragem,
          tipo_combustivel,
          created_at,
          cliente:clients (
            id,
            nome,
            telefone
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar veículos",
        description: "Não foi possível carregar a lista de veículos.",
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
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Veículo excluído",
        description: "Veículo foi excluído com sucesso.",
      });

      fetchVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir veículo",
        description: "Não foi possível excluir o veículo.",
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatVehicleInfo = (vehicle: Vehicle) => {
    return `${vehicle.marca} ${vehicle.modelo} (${vehicle.ano})`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-48">
          <div className="text-lg">Carregando veículos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Veículos
          </h1>
          <Button onClick={() => navigate('/dashboard/veiculos/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Veículo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar veículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm
                    ? `Nenhum resultado para "${searchTerm}"`
                    : 'Cadastre veículos para gerenciar sua frota'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate('/dashboard/veiculos/novo')}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Veículo
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Kilometragem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{vehicle.cliente?.nome}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.cliente?.telefone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatVehicleInfo(vehicle)}</TableCell>
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
                            onClick={() => navigate(`/dashboard/clientes`)}
                            title="Ver cliente"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/dashboard/veiculos/${vehicle.id}/editar`)}
                            title="Editar veículo"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            title="Excluir veículo"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehiclesPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Car } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  nome: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  cor?: string;
  kilometragem?: string;
  veiculo: string;
  created_at?: string;
  is_active?: boolean;
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
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .not('marca', 'is', null)
        .not('modelo', 'is', null)
        .order('nome');

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

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.marca?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (vehicle.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (vehicle.placa?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const formatVehicleInfo = (vehicle: Vehicle) => {
    const parts = [];
    if (vehicle.marca) parts.push(vehicle.marca);
    if (vehicle.modelo) parts.push(vehicle.modelo);
    if (vehicle.ano) parts.push(`(${vehicle.ano})`);
    return parts.join(' ');
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
                <h3 className="text-lg font-medium">
                  {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm
                    ? `Nenhum resultado para "${searchTerm}"`
                    : 'Os veículos são vinculados aos clientes no momento do cadastro'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate('/dashboard/clientes/novo')}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Cliente com Veículo
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
                      <TableCell className="font-medium">{vehicle.nome}</TableCell>
                      <TableCell>{formatVehicleInfo(vehicle)}</TableCell>
                      <TableCell>
                        {vehicle.placa ? (
                          <Badge variant="outline">{vehicle.placa}</Badge>
                        ) : (
                          '-'
                        )}
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
                            onClick={() => navigate(`/dashboard/clientes`)}
                            title="Editar veículo"
                          >
                            <Edit className="h-4 w-4" />
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

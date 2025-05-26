
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatUtils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
  descricao?: string;
  created_at: string;
}

const ServicesListPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('Buscando serviços...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('nome');

      if (error) {
        console.error('Error fetching services:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar serviços",
          description: "Não foi possível carregar a lista de serviços.",
        });
        return;
      }

      console.log('Serviços encontrados:', data?.length || 0);
      console.log('Dados dos serviços:', data);

      const formattedServices: Service[] = (data || []).map(service => ({
        id: service.id,
        nome: service.nome,
        tipo: service.tipo as 'produto' | 'servico',
        valor: typeof service.valor === 'string' ? parseFloat(service.valor) : service.valor,
        descricao: service.descricao,
        created_at: service.created_at
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar os serviços.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.descricao && service.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteService = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço/produto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting service:', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir o serviço/produto.",
        });
        return;
      }

      toast({
        title: "Serviço excluído",
        description: "O serviço/produto foi excluído com sucesso.",
      });

      // Refresh the list
      fetchServices();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao excluir o serviço.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Serviços e Produtos</h1>
          <Button onClick={() => navigate('/servicos')}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Novo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Serviços e Produtos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Buscar serviços ou produtos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando serviços...</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'Nenhum serviço encontrado com esse termo.' : 'Nenhum serviço cadastrado ainda.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.nome}</TableCell>
                      <TableCell>
                        <Badge variant={service.tipo === 'servico' ? 'default' : 'secondary'}>
                          {service.tipo === 'servico' ? 'Serviço' : 'Produto'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(service.valor)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {service.descricao || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Excluir"
                            onClick={() => handleDeleteService(service.id)}
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

export default ServicesListPage;

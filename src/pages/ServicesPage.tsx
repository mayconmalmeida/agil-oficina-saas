
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Wrench, Plus, Edit, Trash2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
  codigo?: string;
  quantidade_estoque?: number;
  preco_custo?: number;
  is_active: boolean;
  created_at: string;
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'servico' | 'produto'>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    let filtered = services.filter(service =>
      service.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(service => service.tipo === filterType);
    }

    setFilteredServices(filtered);
  }, [searchTerm, filterType, services]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar serviços",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item excluído",
        description: "Item excluído com sucesso!"
      });

      loadServices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir item",
        description: error.message
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Item desativado" : "Item ativado",
        description: `Item ${currentStatus ? 'desativado' : 'ativado'} com sucesso!`
      });

      loadServices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status",
        description: error.message
      });
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getTypeIcon = (type: string) => {
    return type === 'produto' ? <Package className="h-4 w-4" /> : <Wrench className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    return type === 'produto' 
      ? <Badge className="bg-blue-100 text-blue-800">Produto</Badge>
      : <Badge className="bg-green-100 text-green-800">Serviço</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Serviços e Produtos</h1>
          <p className="text-muted-foreground">Gerencie os serviços e produtos da sua oficina</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            {services.length} itens cadastrados
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterType === 'servico' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('servico')}
              >
                <Wrench className="h-4 w-4 mr-1" />
                Serviços
              </Button>
              <Button
                variant={filterType === 'produto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('produto')}
              >
                <Package className="h-4 w-4 mr-1" />
                Produtos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum item encontrado' : 'Nenhum serviço ou produto cadastrado'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Card key={service.id} className={`hover:shadow-md transition-shadow ${!service.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getTypeIcon(service.tipo)}
                            <h3 className="font-semibold text-lg truncate">{service.nome}</h3>
                          </div>
                          {service.codigo && (
                            <p className="text-sm text-gray-600">Código: {service.codigo}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getTypeBadge(service.tipo)}
                          {!service.is_active && (
                            <Badge variant="outline" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(service.valor)}
                        </p>
                        
                        {service.tipo === 'produto' && service.quantidade_estoque !== undefined && (
                          <p className="text-sm">
                            <span className="font-medium">Estoque:</span> {service.quantidade_estoque} unidades
                          </p>
                        )}
                        
                        {service.preco_custo && service.preco_custo > 0 && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Custo:</span> {formatCurrency(service.preco_custo)}
                          </p>
                        )}
                        
                        {service.descricao && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {service.descricao}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <Button
                          variant={service.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleStatus(service.id, service.is_active)}
                        >
                          {service.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesPage;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText, Edit, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';

interface Service {
  id: string;
  nome: string;
  tipo: 'produto' | 'servico';
  valor: number;
  descricao?: string;
  is_active?: boolean;
  created_at: string;
}

interface ServiceResponse {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string | null;
  is_active?: boolean | null;
  user_id?: string | null;
  created_at: string;
}

const ServicesListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch services when component mounts
  useEffect(() => {
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) {
        console.error('Error fetching services:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar serviços",
          description: "Não foi possível carregar a lista de serviços e produtos.",
        });
        return;
      }
      
      if (data) {
        // Map the response data to our Service interface with type checking
        const mappedServices: Service[] = data.map((item: ServiceResponse) => ({
          id: item.id,
          nome: item.nome,
          // Ensure tipo is either 'produto' or 'servico'
          tipo: item.tipo === 'servico' ? 'servico' : 'produto',
          valor: item.valor,
          descricao: item.descricao || undefined,
          is_active: item.is_active !== undefined ? item.is_active : true,
          created_at: item.created_at
        }));
        
        setServices(mappedServices);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by filtering services
  };
  
  const handleNewService = () => {
    navigate('/servicos/novo');
  };
  
  const handleEditService = (service: Service) => {
    navigate(`/servicos/editar/${service.id}`);
  };
  
  const handleViewService = (service: Service) => {
    setSelectedService(service);
  };
  
  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedService) return;
    
    try {
      // Instead of deleting, just mark as inactive
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', selectedService.id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao inativar serviço",
          description: error.message,
        });
        return;
      }
      
      // Refresh services list
      await fetchServices();
      
      toast({
        title: "Serviço inativado",
        description: "O serviço foi inativado com sucesso.",
      });
    } catch (error) {
      console.error('Error inactivating service:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao inativar o serviço.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const toggleServiceStatus = async (service: Service) => {
    try {
      const newStatus = !service.is_active;
      
      const { error } = await supabase
        .from('services')
        .update({ is_active: newStatus })
        .eq('id', service.id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao alterar status",
          description: error.message,
        });
        return;
      }
      
      // Refresh services list
      await fetchServices();
      
      toast({
        title: newStatus ? "Serviço ativado" : "Serviço inativado",
        description: `O serviço foi ${newStatus ? 'ativado' : 'inativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status do serviço.",
      });
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Filter services based on search query
  const filteredServices = services.filter(service => 
    !searchQuery || 
    service.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.tipo.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (isActive: boolean = true) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Serviços e Produtos</h1>
          <Button onClick={handleNewService}>
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <TabsList>
                  <TabsTrigger value="lista" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> 
                    Lista de Itens
                  </TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 md:max-w-lg">
                  <Input
                    type="text"
                    placeholder="Buscar por nome, tipo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
              <TabsContent value="lista" className="mt-0">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!loading && filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.nome}</TableCell>
                          <TableCell className="capitalize">{service.tipo}</TableCell>
                          <TableCell className="text-right">{formatCurrency(service.valor)}</TableCell>
                          <TableCell>{getStatusBadge(service.is_active)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Editar"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title={service.is_active ? "Inativar" : "Ativar"}
                                onClick={() => toggleServiceStatus(service)}
                              >
                                {service.is_active ? (
                                  <X className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Carregando serviços...
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {!loading && filteredServices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum serviço ou produto encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inativar Serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja inativar o serviço "{selectedService?.nome}"? 
              Ele não estará mais disponível para novos orçamentos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Inativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesListPage;

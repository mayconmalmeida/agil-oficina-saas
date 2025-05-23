import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Plus, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/utils/supabaseTypes';
import ServiceList from './ServiceList';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';

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
        setServices(mapToServiceType(data));
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
  
  // Inside any component or function that uses Service[]
  const mapToServiceType = (data: any[]): Service[] => {
    return data.map(item => ({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo as "produto" | "servico",
      valor: item.valor,
      descricao: item.descricao || "",
      is_active: item.is_active,
      created_at: item.created_at,
      user_id: item.user_id || ""
    }));
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
                <ServiceList
                  services={services}
                  loading={loading}
                  searchQuery={searchQuery}
                  onEdit={handleEditService}
                  onToggleStatus={toggleServiceStatus}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesListPage;

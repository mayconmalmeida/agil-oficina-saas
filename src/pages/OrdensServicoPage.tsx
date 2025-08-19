
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OrdemServico {
  id: string;
  user_id: string;
  cliente_id: string;
  status: string;
  observacoes: string;
  valor_total: number;
  created_at: string;
  clients?: {
    nome: string;
    telefone: string;
    veiculo: string;
  } | null;
}

const OrdensServicoPage: React.FC = () => {
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchOrdensServico = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients:cliente_id(nome, telefone, veiculo)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Type assertion to handle the query result properly
        const ordensServicoData: OrdemServico[] = data.map(item => ({
          ...item,
          clients: Array.isArray(item.clients) ? item.clients[0] : item.clients
        }));
        setOrdensServico(ordensServicoData);
      }
    } catch (error: any) {
      console.error('Erro ao carregar ordens de serviço:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as ordens de serviço."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdensServico();
  }, [user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtrar ordens localmente por enquanto
  };

  const filteredOrdens = ordensServico.filter(ordem =>
    ordem.clients?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ordem.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ordem.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-blue-100 text-blue-800';
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Peças': return 'bg-orange-100 text-orange-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
          <Button onClick={() => navigate('/ordens-servico/nova')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-6">
              <Input
                type="text"
                placeholder="Buscar ordens de serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <div className="space-y-4">
                {filteredOrdens.map((ordem) => (
                  <Card key={ordem.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">OS #{ordem.id.slice(-8)}</h3>
                            <Badge className={getStatusColor(ordem.status)}>
                              {ordem.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>
                              <strong>Cliente:</strong> {ordem.clients?.nome || 'N/A'}
                            </div>
                            <div>
                              <strong>Veículo:</strong> {ordem.clients?.veiculo || 'N/A'}
                            </div>
                            <div>
                              <strong>Valor:</strong> R$ {ordem.valor_total.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Criado em: {new Date(ordem.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/ordens-servico/${ordem.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredOrdens.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma ordem de serviço encontrada.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdensServicoPage;

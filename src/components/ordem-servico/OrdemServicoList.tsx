
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, ClipboardList, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatUtils';
import Loading from '@/components/ui/loading';
import OrdemServicoViewModal from './OrdemServicoViewModal';
import OrdemServicoEditModal from './OrdemServicoEditModal';

interface OrdemServico {
  id: string;
  cliente_id: string;
  orcamento_id?: string;
  status: string;
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
  valor_total: number;
  cliente_nome?: string;
  orcamento_descricao?: string;
}

interface OrdemServicoListProps {
  searchQuery: string;
}

const OrdemServicoList: React.FC<OrdemServicoListProps> = ({ searchQuery }) => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrdens = async () => {
    try {
      setIsLoading(true);
      
      const { data: ordensData, error: ordensError } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordensError) {
        console.error('Erro ao buscar ordens:', ordensError);
        throw ordensError;
      }

      // Buscar dados dos clientes
      const clienteIds = [...new Set(ordensData?.map(ordem => ordem.cliente_id).filter(Boolean))];
      
      let clientesData: any[] = [];
      if (clienteIds.length > 0) {
        const { data: clientsResult, error: clientsError } = await supabase
          .from('clients')
          .select('id, nome')
          .in('id', clienteIds);

        if (clientsError) {
          console.error('Erro ao buscar clientes:', clientsError);
        } else {
          clientesData = clientsResult || [];
        }
      }

      // Buscar dados dos orçamentos
      const orcamentoIds = [...new Set(ordensData?.map(ordem => ordem.orcamento_id).filter(Boolean))];
      
      let orcamentosData: any[] = [];
      if (orcamentoIds.length > 0) {
        const { data: orcamentosResult, error: orcamentosError } = await supabase
          .from('orcamentos')
          .select('id, descricao')
          .in('id', orcamentoIds);

        if (orcamentosError) {
          console.error('Erro ao buscar orçamentos:', orcamentosError);
        } else {
          orcamentosData = orcamentosResult || [];
        }
      }

      // Combinar os dados
      const ordensFormatted = (ordensData || []).map(ordem => {
        const cliente = clientesData.find(c => c.id === ordem.cliente_id);
        const orcamento = orcamentosData.find(o => o.id === ordem.orcamento_id);
        
        return {
          ...ordem,
          cliente_nome: cliente?.nome || 'Cliente não encontrado',
          orcamento_descricao: orcamento?.descricao || undefined
        };
      });

      setOrdens(ordensFormatted);
    } catch (error: any) {
      console.error('Erro ao buscar ordens:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ordens de serviço",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, []);

  const handleDelete = async (ordemId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', ordemId);

      if (error) throw error;

      toast({
        title: "Ordem de serviço excluída",
        description: "A ordem de serviço foi excluída com sucesso.",
      });

      fetchOrdens();
    } catch (error: any) {
      console.error('Erro ao excluir ordem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir ordem de serviço",
        description: error.message,
      });
    }
  };

  const handleView = (ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setIsViewModalOpen(true);
  };

  const handleEdit = (ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedOrdem(null);
    fetchOrdens();
  };

  const createOSFromBudget = async () => {
    // Implementar lógica para criar OS a partir de orçamento
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Em breve você poderá criar OS a partir de orçamentos.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta': return 'bg-blue-100 text-blue-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Concluída': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrdens = ordens.filter(ordem =>
    ordem.cliente_nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ordem.observacoes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ordem.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Loading text="Carregando ordens de serviço..." />;
  }

  if (filteredOrdens.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma ordem de serviço encontrada
        </h3>
        <p className="text-gray-500 mb-4">
          {searchQuery ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira ordem de serviço.'}
        </p>
        <Button onClick={createOSFromBudget} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Criar OS a partir de Orçamento
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ordens de Serviço ({filteredOrdens.length})</h3>
        <Button onClick={createOSFromBudget} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Criar a partir de Orçamento
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredOrdens.map((ordem) => (
          <Card key={ordem.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    OS #{ordem.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: {ordem.cliente_nome}
                  </p>
                  {ordem.orcamento_descricao && (
                    <p className="text-xs text-gray-500 mt-1">
                      Baseado no orçamento: {ordem.orcamento_descricao}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(ordem.status)}>
                    {ordem.status}
                  </Badge>
                  <p className="text-sm font-medium mt-2">
                    {formatCurrency(ordem.valor_total)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>Iniciado: {new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}</p>
                  {ordem.data_fim && (
                    <p>Finalizado: {new Date(ordem.data_fim).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleView(ordem)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(ordem)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(ordem.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrdemServicoViewModal
        ordem={selectedOrdem}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrdem(null);
        }}
      />

      <OrdemServicoEditModal
        ordem={selectedOrdem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrdem(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default OrdemServicoList;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, ClipboardList } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/supabaseTypes';
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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrdens = async () => {
    try {
      setIsLoading(true);
      
      // First, get the ordens_servico data
      const { data: ordensData, error: ordensError } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordensError) throw ordensError;

      // Get clients data separately
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, nome');

      if (clientsError) throw clientsError;

      // Get orcamentos data separately
      const { data: orcamentosData, error: orcamentosError } = await supabase
        .from('orcamentos')
        .select('id, descricao');

      if (orcamentosError) throw orcamentosError;

      // Combine the data
      const ordensFormatted = (ordensData || []).map(ordem => {
        const cliente = clientsData?.find(c => c.id === ordem.cliente_id);
        const orcamento = orcamentosData?.find(o => o.id === ordem.orcamento_id);
        
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

  const handleView = (ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setViewModalOpen(true);
  };

  const handleEdit = (ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setEditModalOpen(true);
  };

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
        <p className="text-gray-500">
          {searchQuery ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira ordem de serviço.'}
        </p>
      </div>
    );
  }

  return (
    <>
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
                    Cliente: {ordem.cliente_nome || 'N/A'}
                  </p>
                </div>
                <Badge className={getStatusColor(ordem.status)}>
                  {ordem.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Data de Início:</p>
                  <p className="font-medium">
                    {new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total:</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(ordem.valor_total)}
                  </p>
                </div>
                {ordem.orcamento_descricao && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Orçamento Vinculado:</p>
                    <p className="text-sm">{ordem.orcamento_descricao}</p>
                  </div>
                )}
                {ordem.observacoes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Observações:</p>
                    <p className="text-sm">{ordem.observacoes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleView(ordem)}>
                  <Eye className="h-4 w-4 mr-1" /> Visualizar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(ordem)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(ordem.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrdemServicoViewModal
        ordem={selectedOrdem}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedOrdem(null);
        }}
      />

      <OrdemServicoEditModal
        ordem={selectedOrdem}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedOrdem(null);
        }}
        onSuccess={() => {
          fetchOrdens();
        }}
      />
    </>
  );
};

export default OrdemServicoList;

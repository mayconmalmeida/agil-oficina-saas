
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/supabaseTypes';
import Loading from '@/components/ui/loading';

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
  const { toast } = useToast();

  const fetchOrdens = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients:cliente_id (nome),
          orcamentos:orcamento_id (descricao)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordensFormatted = (data || []).map(ordem => ({
        ...ordem,
        cliente_nome: ordem.clients?.nome,
        orcamento_descricao: ordem.orcamentos?.descricao
      }));

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
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" /> Visualizar
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdemServicoList;

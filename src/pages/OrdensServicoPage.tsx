
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface OrdemServico {
  id: string;
  cliente_id: string;
  valor_total: number;
  status: string;
  observacoes: string;
  created_at: string;
  clients: {
    nome: string;
    telefone: string;
  } | null;
}

interface Orcamento {
  id: string;
  cliente: string;
  veiculo: string;
  valor_total: number;
  status: string;
}

const OrdensServicoPage: React.FC = () => {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [selectedOrcamento, setSelectedOrcamento] = useState<string>('');
  const [criarDeOrcamento, setCriarDeOrcamento] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchOrdens();
      fetchOrcamentos();
    }
  }, [user?.id]);

  const fetchOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients (
            nome,
            telefone
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to fix clients type
      const transformedData = (data || []).map(item => ({
        ...item,
        clients: Array.isArray(item.clients) ? item.clients[0] : item.clients
      }));
      
      setOrdens(transformedData);
    } catch (error: any) {
      console.error('Erro ao carregar ordens:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ordens de serviço",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrcamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'aprovado') // Só orçamentos aprovados
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrcamentos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  };

  const criarOrdemDeOrcamento = async () => {
    if (!selectedOrcamento || !user?.id) return;

    try {
      const orcamento = orcamentos.find(o => o.id === selectedOrcamento);
      if (!orcamento) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Orçamento não encontrado",
        });
        return;
      }

      // Usar a função RPC do Supabase para criar ordem de serviço a partir do orçamento
      const { data: novaOrdemId, error } = await supabase
        .rpc('create_ordem_servico_from_orcamento', {
          p_user_id: user.id,
          p_orcamento_id: selectedOrcamento,
          p_observacoes: `Criada a partir do orçamento: ${orcamento.cliente} - ${orcamento.veiculo}`
        });

      if (error) throw error;

      // Atualizar status do orçamento para usado
      await supabase
        .from('orcamentos')
        .update({ status: 'usado' })
        .eq('id', orcamento.id)
        .eq('user_id', user.id);

      toast({
        title: "Ordem de serviço criada",
        description: "A ordem foi criada com sucesso a partir do orçamento.",
      });

      setCriarDeOrcamento(false);
      setSelectedOrcamento('');
      fetchOrdens();
      fetchOrcamentos();

    } catch (error: any) {
      console.error('Erro ao criar ordem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar ordem de serviço",
        description: error.message,
      });
    }
  };

  const deleteOrdem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) return;

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Ordem excluída",
        description: "A ordem de serviço foi excluída com sucesso.",
      });

      fetchOrdens();
    } catch (error: any) {
      console.error('Erro ao excluir ordem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir ordem",
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Aberta': 'default',
      'Em Andamento': 'secondary',
      'Concluída': 'default',
      'Cancelada': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando ordens de serviço...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/ordens-servico/nova')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Ordem
          </Button>
        </div>
      </div>

      {/* Seção para criar ordem a partir de orçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Opções de Criação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="criar-de-orcamento"
              checked={criarDeOrcamento}
              onCheckedChange={(checked) => {
                setCriarDeOrcamento(checked as boolean);
                if (!checked) {
                  setSelectedOrcamento('');
                }
              }}
            />
            <label htmlFor="criar-de-orcamento" className="text-sm font-medium">
              Criar a partir de orçamento existente
            </label>
          </div>

          {criarDeOrcamento && (
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Selecionar Orçamento Aprovado
                </label>
                <Select value={selectedOrcamento} onValueChange={setSelectedOrcamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um orçamento aprovado" />
                  </SelectTrigger>
                  <SelectContent>
                    {orcamentos.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum orçamento aprovado disponível
                      </SelectItem>
                    ) : (
                      orcamentos.map((orcamento) => (
                        <SelectItem key={orcamento.id} value={orcamento.id}>
                          {orcamento.cliente} - {orcamento.veiculo} - {formatCurrency(orcamento.valor_total)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={criarOrdemDeOrcamento}
                disabled={!selectedOrcamento}
              >
                Criar Ordem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {ordens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhuma ordem de serviço encontrada</p>
              <Button onClick={() => navigate('/ordens-servico/nova')}>
                Criar primeira ordem
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.map((ordem) => (
                  <TableRow key={ordem.id}>
                    <TableCell className="font-medium">
                      {ordem.clients?.nome || 'Cliente não encontrado'}
                    </TableCell>
                    <TableCell>{ordem.clients?.telefone || '-'}</TableCell>
                    <TableCell>{formatCurrency(ordem.valor_total)}</TableCell>
                    <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                    <TableCell>
                      {new Date(ordem.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/ordens-servico/${ordem.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/ordens-servico/${ordem.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOrdem(ordem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
};

export default OrdensServicoPage;

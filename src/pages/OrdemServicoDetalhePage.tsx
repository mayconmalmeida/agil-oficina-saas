
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Share, Mail, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface OrdemServico {
  id: string;
  cliente_id: string;
  veiculo_id: string;
  orcamento_id: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  observacoes: string;
  oficina_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
}

const OrdemServicoDetalhePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordemServico, setOrdemServico] = useState<OrdemServico | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrdemServico();
    }
  }, [id]);

  const fetchOrdemServico = async () => {
    try {
      setLoading(true);

      // Buscar ordem de serviço
      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('id', id)
        .single();

      if (osError) {
        console.error('Erro ao buscar ordem de serviço:', osError);
        toast.error('Erro ao carregar ordem de serviço');
        return;
      }

      setOrdemServico(osData);

      // Buscar dados do cliente
      if (osData.cliente_id) {
        const { data: clienteData, error: clienteError } = await supabase
          .from('clients')
          .select('id, nome, telefone, email')
          .eq('id', osData.cliente_id)
          .single();

        if (clienteError) {
          console.error('Erro ao buscar cliente:', clienteError);
        } else {
          setCliente(clienteData);
        }
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (novoStatus: string) => {
    if (!ordemServico) return;

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', ordemServico.id);

      if (error) {
        toast.error('Erro ao atualizar status');
        return;
      }

      setOrdemServico({ ...ordemServico, status: novoStatus });
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success('Preparando impressão...');
  };

  const handleShare = () => {
    toast.success('Função de compartilhamento em desenvolvimento');
  };

  const handleEmail = () => {
    toast.success('Função de envio por email em desenvolvimento');
  };

  const handlePayment = () => {
    toast.success('Função de pagamento em desenvolvimento');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberto': return 'bg-blue-100 text-blue-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'em andamento': return 'bg-yellow-100 text-yellow-800';
      case 'aguardando peças': return 'bg-orange-100 text-orange-800';
      case 'finalizado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ordemServico) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ordem de Serviço não encontrada</h2>
          <Button onClick={() => navigate('/dashboard/ordem-servico')}>
            Voltar para Ordens de Serviço
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Ordem de Serviço #{ordemServico.id.slice(0, 8)}</h1>
        </div>

        {/* Ações Rápidas */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            E-mail
          </Button>
          <Button variant="default" onClick={handlePayment}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamento
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações da OS */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(ordemServico.status)}>
                  {ordemServico.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Início</label>
                  <p className="text-sm">{new Date(ordemServico.data_inicio).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Fim</label>
                  <p className="text-sm">{ordemServico.data_fim ? new Date(ordemServico.data_fim).toLocaleDateString() : 'Não definida'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Valor Total</label>
                <p className="text-lg font-bold text-green-600">
                  R$ {ordemServico.valor_total.toFixed(2)}
                </p>
              </div>

              {ordemServico.observacoes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observações</label>
                  <p className="text-sm mt-1">{ordemServico.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações do Cliente */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cliente ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome</label>
                    <p className="text-sm">{cliente.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <p className="text-sm">{cliente.telefone}</p>
                  </div>
                  {cliente.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">E-mail</label>
                      <p className="text-sm">{cliente.email}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Dados do cliente não encontrados</p>
              )}
            </CardContent>
          </Card>

          {/* Alterar Status */}
          <Card>
            <CardHeader>
              <CardTitle>Alterar Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Aberto', 'Aprovado', 'Em Andamento', 'Aguardando Peças', 'Finalizado', 'Cancelado'].map((status) => (
                <Button
                  key={status}
                  variant={ordemServico.status === status ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrdemServicoDetalhePage;

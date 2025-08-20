
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Printer, Share2, Mail, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
    email: string;
    veiculo: string;
  } | null;
}

const statusOptions = [
  'Aberto',
  'Aprovado', 
  'Em Andamento',
  'Aguardando Peças',
  'Finalizado',
  'Cancelado'
];

const OrdemServicoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ordemServico, setOrdemServico] = useState<OrdemServico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [pagamentoData, setPagamentoData] = useState({
    valor: '',
    forma_pagamento: '',
    observacoes: ''
  });

  const fetchOrdemServico = async () => {
    if (!id || !user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clients:cliente_id(nome, telefone, email, veiculo)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Type assertion to handle the query result properly
        const ordemServicoData: OrdemServico = {
          ...data,
          clients: Array.isArray(data.clients) ? data.clients[0] : data.clients
        };
        setOrdemServico(ordemServicoData);
      }
    } catch (error: any) {
      console.error('Erro ao carregar ordem de serviço:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a ordem de serviço."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdemServico();
  }, [id, user?.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ordemServico || !user?.id) return;

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({ status: newStatus })
        .eq('id', ordemServico.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setOrdemServico(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: "Status atualizado",
        description: "Status da ordem de serviço atualizado com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status."
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (ordemServico?.clients?.telefone) {
      const message = `Olá ${ordemServico.clients.nome}, sua ordem de serviço está com status: ${ordemServico.status}. Valor: R$ ${ordemServico.valor_total.toFixed(2)}`;
      const whatsappUrl = `https://wa.me/55${ordemServico.clients.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEmail = () => {
    if (ordemServico?.clients?.email) {
      const subject = `Ordem de Serviço - ${ordemServico.clients.nome}`;
      const body = `Prezado(a) ${ordemServico.clients.nome},\n\nSua ordem de serviço está com status: ${ordemServico.status}\nValor: R$ ${ordemServico.valor_total.toFixed(2)}\n\nAtenciosamente,\nEquipe`;
      const mailtoUrl = `mailto:${ordemServico.clients.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
    }
  };

  const handlePagamento = async () => {
    if (!ordemServico || !user?.id || !pagamentoData.valor || !pagamentoData.forma_pagamento) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pagamentos_manuais')
        .insert({
          user_id: user.id,
          ordem_servico_id: ordemServico.id,
          valor: parseFloat(pagamentoData.valor),
          forma_pagamento: pagamentoData.forma_pagamento,
          observacoes: pagamentoData.observacoes
        });

      if (error) throw error;

      toast({
        title: "Pagamento registrado",
        description: "Pagamento registrado com sucesso."
      });

      setPagamentoData({ valor: '', forma_pagamento: '', observacoes: '' });
      setIsPagamentoModalOpen(false);
    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar o pagamento."
      });
    }
  };

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (!ordemServico) {
    return <div className="text-center">Ordem de serviço não encontrada.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Ordem de Serviço</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="h-4 w-4 mr-2" />
            E-mail
          </Button>
          <Dialog open={isPagamentoModalOpen} onOpenChange={setIsPagamentoModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pagamento Manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={pagamentoData.valor}
                    onChange={(e) => setPagamentoData(prev => ({ ...prev, valor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select onValueChange={(value) => setPagamentoData(prev => ({ ...prev, forma_pagamento: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={pagamentoData.observacoes}
                    onChange={(e) => setPagamentoData(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPagamentoModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handlePagamento}>
                    Registrar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Cliente:</strong> {ordemServico.clients?.nome || 'N/A'}
            </div>
            <div>
              <strong>Telefone:</strong> {ordemServico.clients?.telefone || 'N/A'}
            </div>
            <div>
              <strong>E-mail:</strong> {ordemServico.clients?.email || 'N/A'}
            </div>
            <div>
              <strong>Veículo:</strong> {ordemServico.clients?.veiculo || 'N/A'}
            </div>
            <div>
              <strong>Valor Total:</strong> R$ {ordemServico.valor_total.toFixed(2)}
            </div>
            <div>
              <strong>Data:</strong> {new Date(ordemServico.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(ordemServico.status)}>
                {ordemServico.status}
              </Badge>
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Alterar status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {ordemServico.observacoes && (
            <div>
              <strong>Observações:</strong>
              <p className="mt-1 text-gray-600">{ordemServico.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdemServicoDetailPage;

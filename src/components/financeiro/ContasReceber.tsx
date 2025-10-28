
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BaixaContaReceber from './BaixaContaReceber';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  observacoes?: string;
  cliente_nome?: string;
}

interface ContasReceberProps {
  onUpdateResumo?: (dados: any) => void;
}

const ContasReceber: React.FC<ContasReceberProps> = ({ onUpdateResumo }) => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clients, setClients] = useState<{ id: string; nome: string }[]>([]);
  const [createForm, setCreateForm] = useState({
    cliente_id: '',
    ordem_servico_id: '',
    descricao: '',
    valor: '',
    desconto: '',
    data_vencimento: '',
    observacoes: ''
  });
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({ tipo: 'valor' as 'valor' | 'percentual', valor: '', motivo: '' });
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ valor_pago: '', desconto: '', forma_pagamento: '', data_pagamento: new Date().toISOString().split('T')[0], observacoes: '' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ descricao: '', valor: '', data_vencimento: '', data_pagamento: '', observacoes: '' });
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [ordensCliente, setOrdensCliente] = useState<{ id: string; valor_total: number; data_fim: string; status: string }[]>([]);
  const [isLoadingOS, setIsLoadingOS] = useState(false);

  const fetchClients = async () => {
    try {
      const { data } = await supabase
        .from('clients')
        .select('id, nome')
        .eq('is_active', true)
        .order('nome');
      setClients(data || []);
    } catch {}
  };

  useEffect(() => {
    if (isCreateOpen) fetchClients();
  }, [isCreateOpen]);

  const fetchOrdensFinalizadasCliente = async (clienteId: string) => {
    try {
      if (!clienteId) { setOrdensCliente([]); return; }
      setIsLoadingOS(true);
      const { data: ordensData, error: ordensError } = await supabase
        .from('ordens_servico')
        .select('id, cliente_id, valor_total, data_fim, status')
        .eq('cliente_id', clienteId)
        .in('status', ['Concluída', 'Finalizado'])
        .not('data_fim', 'is', null)
        .order('data_fim', { ascending: false });
      if (ordensError) throw ordensError;
      const ordensIds = (ordensData || []).map((o: any) => o.id);
      let idsComConta = new Set<string>();
      if (ordensIds.length > 0) {
        const { data: contasExistentes } = await supabase
          .from('contas_receber')
          .select('ordem_servico_id')
          .in('ordem_servico_id', ordensIds);
        idsComConta = new Set((contasExistentes || []).map((c: any) => c.ordem_servico_id));
      }
      const disponiveis = (ordensData || []).filter((o: any) => !idsComConta.has(o.id));
      setOrdensCliente(disponiveis as any);
    } catch (err) {
      console.error('Erro ao buscar OS finalizadas do cliente:', err);
      setOrdensCliente([]);
    } finally {
      setIsLoadingOS(false);
    }
  };

  useEffect(() => {
    fetchOrdensFinalizadasCliente(createForm.cliente_id);
    setCreateForm(prev => ({ ...prev, ordem_servico_id: '' }));
  }, [createForm.cliente_id]);

  const fetchContas = async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        setContas([]);
        if (onUpdateResumo) onUpdateResumo({ totalReceber: 0 });
        return;
      }
      
      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          *,
          clients(nome)
        `)
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;

      const contasFormatted = (data || []).map(conta => ({
        ...conta,
        cliente_nome: conta.clients?.nome || 'Cliente não informado'
      }));

      // Normalizar status e marcar vencidos automaticamente
      const hoje = new Date();
      const contasComStatus = contasFormatted.map((conta) => {
        const vencimento = new Date(conta.data_vencimento);
        const statusRaw = (conta.status || '').toLowerCase();
        let status: 'pendente' | 'pago' | 'vencido';
        if (statusRaw === 'pago') {
          status = 'pago';
        } else if (vencimento < hoje) {
          status = 'vencido';
        } else {
          // Tratar valores nulos ou diferentes como pendente
          status = 'pendente';
        }
        return { ...conta, status };
      });

      setContas(contasComStatus as any);

      // Atualizar resumo: somar tudo que não está pago
      const totalReceber = contasComStatus
        .filter(conta => conta.status === 'pendente' || conta.status === 'vencido')
        .reduce((sum, conta) => sum + Number(conta.valor || 0), 0);

      if (onUpdateResumo) {
        onUpdateResumo({ totalReceber });
      }

    } catch (error: any) {
      console.error('Erro ao carregar contas a receber:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as contas a receber."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
  }, [user?.id]);

  const handleCreateConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const valorNum = parseFloat(createForm.valor || '0');
      const descontoNum = parseFloat(createForm.desconto || '0');
      const valorCriado = Math.max(valorNum - descontoNum, 0);

      const obsDesconto = descontoNum > 0 
        ? `${createForm.observacoes || ''}\nDesconto aplicado na criação: R$ ${descontoNum.toFixed(2)}`.trim()
        : (createForm.observacoes || null);

      const { error } = await supabase
        .from('contas_receber')
        .insert({
          user_id: user.id,
          cliente_id: createForm.cliente_id || null,
          ordem_servico_id: createForm.ordem_servico_id || null,
          descricao: createForm.descricao,
          valor: valorCriado,
          data_vencimento: createForm.data_vencimento,
          status: 'pendente',
          observacoes: obsDesconto
        });

      if (error) throw error;

      toast({ title: 'Conta criada', description: 'Conta a receber registrada com sucesso.' });
      setIsCreateOpen(false);
      setCreateForm({ cliente_id: '', ordem_servico_id: '', descricao: '', valor: '', desconto: '', data_vencimento: '', observacoes: '' });
      fetchContas();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      const { error } = await supabase
        .from('contas_receber')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: "A conta foi excluída com sucesso."
      });

      fetchContas();
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  const marcarComoPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_receber')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta marcada como paga",
        description: "A conta foi atualizada com sucesso."
      });

      fetchContas();
    } catch (error: any) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  const getStatusColor = (status: string, dataVencimento: string) => {
    if (status === 'pago') return 'bg-green-100 text-green-800';
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (vencimento < hoje) return 'bg-red-100 text-red-800'; // Vencido
    return 'bg-yellow-100 text-yellow-800'; // Pendente
  };

  const getStatusText = (status: string, dataVencimento: string) => {
    if (status === 'pago') return 'Pago';
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    
    if (vencimento < hoje) return 'Vencido';
    return 'Pendente';
  };

  const contasFiltradas = contas.filter(conta =>
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Contas a Receber</CardTitle>
          <div className="flex gap-2">
            <BaixaContaReceber onSuccess={fetchContas} />
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nova Conta a Receber</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateConta} className="space-y-4">
                  <div>
                    <Label>Cliente (opcional)</Label>
                    <Select onValueChange={(value) => setCreateForm({ ...createForm, cliente_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {createForm.cliente_id && (
                    <div>
                      <Label>Ordem de Serviço Finalizada (opcional)</Label>
                      <Select onValueChange={(value) => {
                        setCreateForm(prev => ({ ...prev, ordem_servico_id: value }));
                        const ordem = ordensCliente.find(o => o.id === value);
                        if (ordem) {
                          if (!createForm.descricao) {
                            setCreateForm(prev => ({ ...prev, descricao: `Cobrança OS #${ordem.id}` }));
                          }
                          if (!createForm.valor) {
                            setCreateForm(prev => ({ ...prev, valor: String(Number(ordem.valor_total || 0)) }));
                          }
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingOS ? 'Carregando...' : (ordensCliente.length ? 'Selecione uma OS' : 'Sem OS finalizada para este cliente')} />
                        </SelectTrigger>
                        <SelectContent>
                          {ordensCliente.map(o => (
                            <SelectItem key={o.id} value={o.id}>
                              {`OS #${o.id} — R$ ${Number(o.valor_total || 0).toFixed(2)} — ${o.data_fim ? new Date(o.data_fim).toLocaleDateString('pt-BR') : ''}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={createForm.descricao}
                      onChange={(e) => setCreateForm({ ...createForm, descricao: e.target.value })}
                      placeholder="Ex.: Mensalidade, serviço avulso, evento X"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={createForm.valor}
                        onChange={(e) => setCreateForm({ ...createForm, valor: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div>
                      <Label>Desconto (opcional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={createForm.desconto}
                        onChange={(e) => setCreateForm({ ...createForm, desconto: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label>Vencimento</Label>
                      <Input
                        type="date"
                        value={createForm.data_vencimento}
                        onChange={(e) => setCreateForm({ ...createForm, data_vencimento: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={createForm.observacoes}
                      onChange={(e) => setCreateForm({ ...createForm, observacoes: e.target.value })}
                      placeholder="Informações adicionais"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">
                    {conta.descricao}
                  </TableCell>
                  <TableCell>{conta.cliente_nome}</TableCell>
                  <TableCell>
                    R$ {conta.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(conta.status, conta.data_vencimento)}>
                      {getStatusText(conta.status, conta.data_vencimento)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {conta.status !== 'pago' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedConta(conta); setIsPayOpen(true); setPayForm(prev => ({ ...prev, valor_pago: String(conta.valor), desconto: '' })); }}
                          >
                            Receber
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedConta(conta); setIsDiscountOpen(true); setDiscountForm({ tipo: 'valor', valor: '', motivo: '' }); }}
                          >
                            Desconto
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedConta(conta);
                          setEditForm({
                            descricao: conta.descricao || '',
                            valor: String(conta.valor ?? ''),
                            data_vencimento: conta.data_vencimento ? new Date(conta.data_vencimento).toISOString().split('T')[0] : '',
                            data_pagamento: conta.data_pagamento ? new Date(conta.data_pagamento).toISOString().split('T')[0] : '',
                            observacoes: conta.observacoes || ''
                          });
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(conta.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Modal Aplicar Desconto */}
        <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Aplicar Desconto</DialogTitle>
            </DialogHeader>
            {selectedConta && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const valorNumero = parseFloat(discountForm.valor || '0');
                  const novoValor = discountForm.tipo === 'percentual'
                    ? selectedConta.valor - (selectedConta.valor * (valorNumero / 100))
                    : selectedConta.valor - valorNumero;
                  const { error } = await supabase
                    .from('contas_receber')
                    .update({
                      valor: Math.max(novoValor, 0),
                      observacoes: `${selectedConta.observacoes || ''}\nDesconto aplicado: ${discountForm.tipo === 'percentual' ? valorNumero + '%' : 'R$ ' + valorNumero.toFixed(2)}${discountForm.motivo ? ' - ' + discountForm.motivo : ''}`.trim()
                    })
                    .eq('id', selectedConta.id);
                  if (error) throw error;
                  toast({ title: 'Desconto aplicado', description: 'O valor da conta foi atualizado.' });
                  setIsDiscountOpen(false);
                  setSelectedConta(null);
                  setDiscountForm({ tipo: 'valor', valor: '', motivo: '' });
                  fetchContas();
                } catch (error: any) {
                  toast({ variant: 'destructive', title: 'Erro', description: error.message });
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select onValueChange={(value) => setDiscountForm(prev => ({ ...prev, tipo: value as 'valor' | 'percentual' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valor">Valor (R$)</SelectItem>
                        <SelectItem value="percentual">Percentual (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Desconto</Label>
                    <Input type="number" step="0.01" value={discountForm.valor} onChange={(e) => setDiscountForm(prev => ({ ...prev, valor: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Textarea value={discountForm.motivo} onChange={(e) => setDiscountForm(prev => ({ ...prev, motivo: e.target.value }))} placeholder="Motivo do desconto" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDiscountOpen(false)}>Cancelar</Button>
                  <Button type="submit">Aplicar</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Receber Pagamento */}
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Receber Pagamento</DialogTitle>
            </DialogHeader>
            {selectedConta && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const valorPago = parseFloat(payForm.valor_pago || '0');
                  const desconto = parseFloat(payForm.desconto || '0');
                  const valorFinal = Math.max(valorPago - desconto, 0);
                  const { error } = await supabase
                    .from('contas_receber')
                    .update({
                      status: 'pago',
                      data_pagamento: payForm.data_pagamento,
                      valor: valorFinal,
                      observacoes: `${selectedConta.observacoes || ''}\nPago via ${payForm.forma_pagamento || 'não informado'}${desconto ? ` (desconto R$ ${desconto.toFixed(2)})` : ''}${payForm.observacoes ? ` - ${payForm.observacoes}` : ''}`.trim()
                    })
                    .eq('id', selectedConta.id);
                  if (error) throw error;
                  // Preparar dados do comprovante
                  setReceiptData({
                    descricao: selectedConta.descricao,
                    cliente: selectedConta.cliente_nome,
                    valorOriginal: selectedConta.valor,
                    desconto,
                    valorPago: valorFinal,
                    forma: payForm.forma_pagamento,
                    data: payForm.data_pagamento,
                    contaId: selectedConta.id
                  });
                  setReceiptOpen(true);
                  setIsPayOpen(false);
                  setSelectedConta(null);
                  setPayForm({ valor_pago: '', desconto: '', forma_pagamento: '', data_pagamento: new Date().toISOString().split('T')[0], observacoes: '' });
                  fetchContas();
                } catch (error: any) {
                  toast({ variant: 'destructive', title: 'Erro', description: error.message });
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor pago</Label>
                    <Input type="number" step="0.01" value={payForm.valor_pago} onChange={(e) => setPayForm(prev => ({ ...prev, valor_pago: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Desconto</Label>
                    <Input type="number" step="0.01" value={payForm.desconto} onChange={(e) => setPayForm(prev => ({ ...prev, desconto: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={payForm.data_pagamento} onChange={(e) => setPayForm(prev => ({ ...prev, data_pagamento: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Forma de pagamento</Label>
                    <Select onValueChange={(value) => setPayForm(prev => ({ ...prev, forma_pagamento: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea value={payForm.observacoes} onChange={(e) => setPayForm(prev => ({ ...prev, observacoes: e.target.value }))} placeholder="Informações adicionais" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPayOpen(false)}>Cancelar</Button>
                  <Button type="submit">Confirmar recebimento</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Editar Conta */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Conta a Receber</DialogTitle>
            </DialogHeader>
            {selectedConta && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const valorNumero = parseFloat(editForm.valor || '0');
                  const payload: any = {
                    descricao: editForm.descricao,
                    valor: isNaN(valorNumero) ? selectedConta.valor : valorNumero,
                    data_vencimento: editForm.data_vencimento,
                    observacoes: editForm.observacoes
                  };
                  // Se já está pago, permitir ajustar a data de pagamento; manter status como 'pago'
                  if (selectedConta.status === 'pago') {
                    payload.data_pagamento = editForm.data_pagamento || selectedConta.data_pagamento;
                    payload.status = 'pago';
                  }

                  const { error } = await supabase
                    .from('contas_receber')
                    .update(payload)
                    .eq('id', selectedConta.id);
                  if (error) throw error;

                  toast({ title: 'Conta atualizada', description: 'Os dados da conta foram salvos.' });
                  setIsEditOpen(false);
                  setSelectedConta(null);
                  setEditForm({ descricao: '', valor: '', data_vencimento: '', data_pagamento: '', observacoes: '' });
                  fetchContas();
                } catch (error: any) {
                  toast({ variant: 'destructive', title: 'Erro', description: error.message });
                }
              }} className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input value={editForm.descricao} onChange={(e) => setEditForm(prev => ({ ...prev, descricao: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor</Label>
                    <Input type="number" step="0.01" value={editForm.valor} onChange={(e) => setEditForm(prev => ({ ...prev, valor: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input type="date" value={editForm.data_vencimento} onChange={(e) => setEditForm(prev => ({ ...prev, data_vencimento: e.target.value }))} required />
                  </div>
                </div>
                {selectedConta.status === 'pago' && (
                  <div>
                    <Label>Data de Pagamento</Label>
                    <Input type="date" value={editForm.data_pagamento} onChange={(e) => setEditForm(prev => ({ ...prev, data_pagamento: e.target.value }))} />
                  </div>
                )}
                <div>
                  <Label>Observações</Label>
                  <Textarea value={editForm.observacoes} onChange={(e) => setEditForm(prev => ({ ...prev, observacoes: e.target.value }))} placeholder="Informações adicionais" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar alterações</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Comprovante de Pagamento */}
        <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Comprovante de Pagamento</DialogTitle>
            </DialogHeader>
            {receiptData && (
              <div id="recibo">
                <div className="space-y-2">
                  <div className="font-bold">{receiptData.descricao}</div>
                  <div>Cliente: {receiptData.cliente || 'N/I'}</div>
                  <div>Data: {new Date(receiptData.data).toLocaleDateString('pt-BR')}</div>
                  <div>Forma: {receiptData.forma || 'N/I'}</div>
                  <div>Valor original: R$ {Number(receiptData.valorOriginal).toFixed(2)}</div>
                  <div>Desconto: R$ {Number(receiptData.desconto || 0).toFixed(2)}</div>
                  <div className="font-medium">Valor pago: R$ {Number(receiptData.valorPago).toFixed(2)}</div>
                  <div>ID da conta: {receiptData.contaId}</div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => window.print()}>Imprimir</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContasReceber;

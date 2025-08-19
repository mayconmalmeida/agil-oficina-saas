
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ContaReceber {
  id: string;
  cliente_id?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: 'pendente' | 'recebido' | 'vencido';
  created_at: string;
  clients?: {
    nome: string;
  };
}

interface Client {
  id: string;
  nome: string;
}

interface ContasReceberProps {
  onUpdateResumo?: (resumo: any) => void;
}

const ContasReceber: React.FC<ContasReceberProps> = ({ onUpdateResumo }) => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cliente_id: '',
    descricao: '',
    valor: '',
    data_vencimento: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (clienteSearch.length >= 2) {
      buscarClientes();
    } else {
      setClients([]);
    }
  }, [clienteSearch]);

  const carregarDados = async () => {
    try {
      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          *,
          clients(nome)
        `)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      
      const contasComStatus = (data || []).map(conta => ({
        ...conta,
        status: new Date(conta.data_vencimento) < new Date() && conta.status === 'pendente' 
          ? 'vencido' as const
          : conta.status as 'pendente' | 'recebido' | 'vencido'
      }));
      
      setContas(contasComStatus);
      calcularResumo(contasComStatus);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as contas a receber."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nome')
        .ilike('nome', `%${clienteSearch}%`)
        .limit(10);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const calcularResumo = (contasList: ContaReceber[]) => {
    const totalReceber = contasList
      .filter(conta => conta.status === 'pendente' || conta.status === 'vencido')
      .reduce((sum, conta) => sum + conta.valor, 0);
    
    if (onUpdateResumo) {
      onUpdateResumo({
        totalReceber,
        movimentacoesMes: contasList.length
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('contas_receber')
        .insert({
          cliente_id: formData.cliente_id || null,
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          data_vencimento: formData.data_vencimento,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Conta adicionada",
        description: "Nova conta a receber foi registrada com sucesso.",
      });

      setFormData({ cliente_id: '', descricao: '', valor: '', data_vencimento: '' });
      setClienteSearch('');
      setIsDialogOpen(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar a conta."
      });
    }
  };

  const marcarComoRecebido = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_receber')
        .update({ 
          status: 'recebido',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta recebida",
        description: "Conta marcada como recebida com sucesso.",
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar como recebido:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a conta como recebida."
      });
    }
  };

  const contasFiltradas = contas.filter(conta =>
    conta.clients?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recebido': return 'bg-green-100 text-green-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando contas...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Contas a Receber</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Conta a Receber</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cliente_search">Cliente</Label>
                  <div className="space-y-2">
                    <Input
                      id="cliente_search"
                      placeholder="Digite o nome do cliente (mín. 2 caracteres)"
                      value={clienteSearch}
                      onChange={(e) => setClienteSearch(e.target.value)}
                    />
                    {clients.length > 0 && (
                      <div className="border rounded-md max-h-32 overflow-y-auto">
                        {clients.map((client) => (
                          <div
                            key={client.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData({...formData, cliente_id: client.id});
                              setClienteSearch(client.nome);
                              setClients([]);
                            }}
                          >
                            {client.nome}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contasFiltradas.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell className="font-medium">{conta.clients?.nome || 'N/A'}</TableCell>
                <TableCell>{conta.descricao}</TableCell>
                <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(conta.status)}>
                    {conta.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {conta.status !== 'recebido' && (
                    <Button
                      size="sm"
                      onClick={() => marcarComoRecebido(conta.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ContasReceber;

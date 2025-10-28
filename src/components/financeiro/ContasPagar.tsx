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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ContaPagar {
  id: string;
  fornecedor_id?: string;
  descricao: string;
  categoria?: string;
  valor: number;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'vencido';
  created_at: string;
  fornecedores?: {
    nome: string;
  };
}

interface Fornecedor {
  id: string;
  nome: string;
}

interface ContasPagarProps {
  onUpdateResumo?: (resumo: any) => void;
}

const ContasPagar: React.FC<ContasPagarProps> = ({ onUpdateResumo }) => {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fornecedorSearch, setFornecedorSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fornecedor_id: '',
    descricao: '',
    categoria: '',
    valor: '',
    data_vencimento: ''
  });

  const categorias = [
    'Fornecedores',
    'Aluguel',
    'Energia',
    'Telefone/Internet',
    'Combustível',
    'Material de Escritório',
    'Equipamentos',
    'Outros'
  ];

  useEffect(() => {
    carregarDados();
  }, [user?.id]);

  useEffect(() => {
    if (fornecedorSearch.length >= 2) {
      buscarFornecedores();
    } else {
      setFornecedores([]);
    }
  }, [fornecedorSearch]);

  const carregarDados = async () => {
    try {
      if (!user?.id) {
        setContas([]);
        calcularResumo([]);
        return;
      }
      const { data, error } = await supabase
        .from('contas_pagar')
        .select(`
          *,
          fornecedores(nome)
        `)
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      
      const contasComStatus = (data || []).map(conta => ({
        ...conta,
        status: new Date(conta.data_vencimento) < new Date() && conta.status === 'pendente' 
          ? 'vencido' as const
          : conta.status as 'pendente' | 'pago' | 'vencido'
      }));
      
      setContas(contasComStatus);
      calcularResumo(contasComStatus);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as contas a pagar."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('id, nome')
        .ilike('nome', `%${fornecedorSearch}%`)
        .limit(10);

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const calcularResumo = (contasList: ContaPagar[]) => {
    const totalPagar = contasList
      .filter(conta => conta.status === 'pendente' || conta.status === 'vencido')
      .reduce((sum, conta) => sum + conta.valor, 0);
    
    if (onUpdateResumo) {
      onUpdateResumo({
        totalPagar
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado."
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contas_pagar')
        .insert({
          user_id: user.id,
          fornecedor_id: formData.fornecedor_id || null,
          descricao: formData.descricao,
          categoria: formData.categoria,
          valor: parseFloat(formData.valor),
          data_vencimento: formData.data_vencimento,
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: "Conta adicionada",
        description: "Nova conta a pagar foi registrada com sucesso.",
      });

      setFormData({ fornecedor_id: '', descricao: '', categoria: '', valor: '', data_vencimento: '' });
      setFornecedorSearch('');
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

  const marcarComoPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_pagar')
        .update({ 
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Conta paga",
        description: "Conta marcada como paga com sucesso.",
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a conta como paga."
      });
    }
  };

  const contasFiltradas = contas.filter(conta =>
    conta.fornecedores?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
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
          <CardTitle>Contas a Pagar</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Conta a Pagar</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fornecedor_search">Fornecedor</Label>
                  <div className="space-y-2">
                    <Input
                      id="fornecedor_search"
                      placeholder="Digite o nome do fornecedor (mín. 2 caracteres)"
                      value={fornecedorSearch}
                      onChange={(e) => setFornecedorSearch(e.target.value)}
                    />
                    {fornecedores.length > 0 && (
                      <div className="border rounded-md max-h-32 overflow-y-auto">
                        {fornecedores.map((fornecedor) => (
                          <div
                            key={fornecedor.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData({...formData, fornecedor_id: fornecedor.id});
                              setFornecedorSearch(fornecedor.nome);
                              setFornecedores([]);
                            }}
                          >
                            {fornecedor.nome}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <TableHead>Fornecedor</TableHead>
              <TableHead>Categoria</TableHead>
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
                <TableCell className="font-medium">{conta.fornecedores?.nome || 'N/A'}</TableCell>
                <TableCell>{conta.categoria || 'N/A'}</TableCell>
                <TableCell>{conta.descricao}</TableCell>
                <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(conta.status)}>
                    {conta.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {conta.status !== 'pago' && (
                    <Button
                      size="sm"
                      onClick={() => marcarComoPago(conta.id)}
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

export default ContasPagar;

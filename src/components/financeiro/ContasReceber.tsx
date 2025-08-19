
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ContaReceber {
  id: string;
  cliente: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'recebido' | 'vencido';
  created_at: string;
}

interface ContasReceberProps {
  onUpdateResumo: (resumo: any) => void;
}

const ContasReceber: React.FC<ContasReceberProps> = ({ onUpdateResumo }) => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cliente: '',
    descricao: '',
    valor: '',
    vencimento: ''
  });

  useEffect(() => {
    // Simular dados iniciais
    const contasIniciais: ContaReceber[] = [
      {
        id: '1',
        cliente: 'João Silva',
        descricao: 'Serviço de revisão completa',
        valor: 450.00,
        vencimento: '2024-02-15',
        status: 'pendente',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        cliente: 'Maria Santos',
        descricao: 'Troca de óleo e filtros',
        valor: 180.00,
        vencimento: '2024-02-10',
        status: 'vencido',
        created_at: new Date().toISOString()
      }
    ];
    setContas(contasIniciais);
    calcularResumo(contasIniciais);
  }, []);

  const calcularResumo = (contasList: ContaReceber[]) => {
    const totalReceber = contasList
      .filter(conta => conta.status === 'pendente' || conta.status === 'vencido')
      .reduce((sum, conta) => sum + conta.valor, 0);
    
    onUpdateResumo(prev => ({
      ...prev,
      totalReceber,
      movimentacoesMes: contasList.length
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaConta: ContaReceber = {
      id: Date.now().toString(),
      cliente: formData.cliente,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      vencimento: formData.vencimento,
      status: new Date(formData.vencimento) < new Date() ? 'vencido' : 'pendente',
      created_at: new Date().toISOString()
    };

    const novasContas = [...contas, novaConta];
    setContas(novasContas);
    calcularResumo(novasContas);
    
    setFormData({ cliente: '', descricao: '', valor: '', vencimento: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Conta adicionada",
      description: "Nova conta a receber foi registrada com sucesso.",
    });
  };

  const marcarComoRecebido = (id: string) => {
    const novasContas = contas.map(conta => 
      conta.id === id ? { ...conta, status: 'recebido' as const } : conta
    );
    setContas(novasContas);
    calcularResumo(novasContas);
    
    toast({
      title: "Conta recebida",
      description: "Conta marcada como recebida com sucesso.",
    });
  };

  const contasFiltradas = contas.filter(conta =>
    conta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    required
                  />
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
                  <Label htmlFor="vencimento">Data de Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({...formData, vencimento: e.target.value})}
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
                <TableCell className="font-medium">{conta.cliente}</TableCell>
                <TableCell>{conta.descricao}</TableCell>
                <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                <TableCell>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</TableCell>
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

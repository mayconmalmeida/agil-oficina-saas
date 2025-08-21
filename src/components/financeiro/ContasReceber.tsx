
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import BaixaContaReceber from './BaixaContaReceber';

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

  const fetchContas = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          *,
          clients!inner(nome)
        `)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;

      const contasFormatted = (data || []).map(conta => ({
        ...conta,
        cliente_nome: conta.clients?.nome || 'Cliente não informado'
      }));

      setContas(contasFormatted);

      // Atualizar resumo
      const totalReceber = contasFormatted
        .filter(conta => conta.status === 'pendente')
        .reduce((sum, conta) => sum + conta.valor, 0);

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
  }, []);

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => marcarComoPago(conta.id)}
                        >
                          Pagar
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
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
      </CardContent>
    </Card>
  );
};

export default ContasReceber;

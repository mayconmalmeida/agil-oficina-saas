
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatUtils';

interface OrdemServicoFinalizada {
  id: string;
  cliente_nome: string;
  valor_total: number;
  data_fim: string;
  status: string;
}

interface BaixaContaReceberProps {
  onSuccess?: () => void;
}

const BaixaContaReceber: React.FC<BaixaContaReceberProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ordens, setOrdens] = useState<OrdemServicoFinalizada[]>([]);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServicoFinalizada | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    valor_recebido: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    forma_pagamento: '',
    observacoes: ''
  });
  const { toast } = useToast();

  const fetchOrdensFinalizadas = async () => {
    try {
      setIsLoading(true);

      const { data: ordensData, error: ordensError } = await supabase
        .from('ordens_servico')
        .select('id, cliente_id, valor_total, data_fim, status')
        .eq('status', 'Concluída')
        .not('data_fim', 'is', null)
        .order('data_fim', { ascending: false });

      if (ordensError) throw ordensError;

      // Buscar dados dos clientes
      const clienteIds = [...new Set(ordensData?.map(ordem => ordem.cliente_id).filter(Boolean))];
      
      let clientesData: any[] = [];
      if (clienteIds.length > 0) {
        const { data: clientsResult } = await supabase
          .from('clients')
          .select('id, nome')
          .in('id', clienteIds);
        
        clientesData = clientsResult || [];
      }

      // Verificar quais já têm conta a receber
      const ordensIds = ordensData?.map(o => o.id) || [];
      const { data: contasExistentes } = await supabase
        .from('contas_receber')
        .select('ordem_servico_id')
        .in('ordem_servico_id', ordensIds);

      const idsComConta = new Set(contasExistentes?.map(c => c.ordem_servico_id) || []);

      // Filtrar ordens que ainda não têm conta a receber
      const ordemsSemConta = (ordensData || [])
        .filter(ordem => !idsComConta.has(ordem.id))
        .map(ordem => {
          const cliente = clientesData.find(c => c.id === ordem.cliente_id);
          return {
            ...ordem,
            cliente_nome: cliente?.nome || 'Cliente não encontrado'
          };
        });

      setOrdens(ordemsSemConta);
    } catch (error: any) {
      console.error('Erro ao carregar ordens finalizadas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as ordens finalizadas."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrdensFinalizadas();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrdem) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione uma ordem de serviço."
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar conta a receber
      const { error } = await supabase
        .from('contas_receber')
        .insert({
          user_id: user.id,
          ordem_servico_id: selectedOrdem.id,
          descricao: `Pagamento OS #${selectedOrdem.id.slice(0, 8)} - ${selectedOrdem.cliente_nome}`,
          valor: parseFloat(formData.valor_recebido) || selectedOrdem.valor_total,
          data_vencimento: formData.data_pagamento,
          data_pagamento: formData.data_pagamento,
          status: 'pago',
          observacoes: formData.observacoes
        });

      if (error) throw error;

      toast({
        title: "Baixa realizada com sucesso",
        description: "A conta foi registrada como paga."
      });

      setIsOpen(false);
      setSelectedOrdem(null);
      setFormData({
        valor_recebido: '',
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: '',
        observacoes: ''
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Erro ao registrar baixa:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="h-4 w-4 mr-2" />
          Baixar de OS
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Baixa de Conta a Receber - OS Finalizada</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Selecionar Ordem de Serviço Finalizada</Label>
            <Select onValueChange={(value) => {
              const ordem = ordens.find(o => o.id === value);
              setSelectedOrdem(ordem || null);
              if (ordem) {
                setFormData(prev => ({ ...prev, valor_recebido: ordem.valor_total.toString() }));
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Busque por uma OS finalizada..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : ordens.length === 0 ? (
                  <SelectItem value="empty" disabled>Nenhuma OS finalizada encontrada</SelectItem>
                ) : (
                  ordens.map((ordem) => (
                    <SelectItem key={ordem.id} value={ordem.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>#{ordem.id.slice(0, 8)} - {ordem.cliente_nome}</span>
                        <span className="ml-2 font-medium">{formatCurrency(ordem.valor_total)}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedOrdem && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor a Receber</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_recebido}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_recebido: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Data do Pagamento</Label>
                  <Input
                    type="date"
                    value={formData.data_pagamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Forma de Pagamento</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar Baixa
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BaixaContaReceber;

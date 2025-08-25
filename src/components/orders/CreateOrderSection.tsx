import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
}

interface CreateOrderSectionProps {
  onSuccess: () => void;
}

const CreateOrderSection: React.FC<CreateOrderSectionProps> = ({ onSuccess }) => {
  const [useExistingBudget, setUseExistingBudget] = useState(false);
  const [availableBudgets, setAvailableBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (useExistingBudget) {
      fetchApprovedBudgets();
    }
  }, [useExistingBudget]);

  const fetchApprovedBudgets = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableBudgets(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os orçamentos aprovados."
      });
    }
  };

  const createOrderFromBudget = async () => {
    if (!selectedBudgetId || !user?.id) return;

    try {
      setIsLoading(true);
      
      // Buscar dados do orçamento selecionado
      const { data: budgetData, error: budgetError } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', selectedBudgetId)
        .single();

      if (budgetError) throw budgetError;

      // Buscar cliente pelo nome (assumindo que o nome é único por usuário)
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('nome', budgetData.cliente)
        .maybeSingle();

      if (clientError) throw clientError;

      // Criar a ordem de serviço
      const { data: orderData, error: orderError } = await supabase
        .from('ordens_servico')
        .insert({
          user_id: user.id,
          cliente_id: clientData?.id,
          orcamento_id: selectedBudgetId,
          status: 'Aberta',
          observacoes: observacoes,
          valor_total: budgetData.valor_total
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Atualizar status do orçamento para "convertido"
      await supabase
        .from('orcamentos')
        .update({ status: 'convertido' })
        .eq('id', selectedBudgetId);

      toast({
        title: "Ordem de serviço criada",
        description: `Ordem de serviço #${orderData.id.slice(0, 8)} criada com sucesso a partir do orçamento.`
      });

      // Reset form
      setUseExistingBudget(false);
      setSelectedBudgetId('');
      setObservacoes('');
      
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar ordem de serviço:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a ordem de serviço."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBudget = availableBudgets.find(b => b.id === selectedBudgetId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Criar Nova Ordem de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useExistingBudget"
            checked={useExistingBudget}
            onCheckedChange={(checked) => setUseExistingBudget(checked === true)}
          />
          <Label 
            htmlFor="useExistingBudget" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Criar a partir de orçamento existente
          </Label>
        </div>

        {useExistingBudget && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget-select">Selecionar Orçamento Aprovado</Label>
              <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um orçamento aprovado..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBudgets.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      Nenhum orçamento aprovado encontrado
                    </SelectItem>
                  ) : (
                    availableBudgets.map((budget) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            #{budget.id.slice(0, 8)} - {budget.cliente}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            R$ {budget.valor_total.toFixed(2)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedBudget && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Prévia do Orçamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Cliente:</span> {selectedBudget.cliente}
                    </div>
                    <div>
                      <span className="font-medium">Veículo:</span> {selectedBudget.veiculo}
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span> R$ {selectedBudget.valor_total.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {new Date(selectedBudget.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="font-medium text-sm">Descrição:</span>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {selectedBudget.descricao}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações específicas para esta ordem de serviço..."
                rows={3}
              />
            </div>

            <Button 
              onClick={createOrderFromBudget}
              disabled={!selectedBudgetId || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando Ordem...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Criar Ordem de Serviço
                </>
              )}
            </Button>
          </div>
        )}

        {!useExistingBudget && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Marque a opção acima para criar uma ordem de serviço a partir de um orçamento aprovado</p>
            <p className="text-sm mt-2">ou use o formulário tradicional de criação de ordem de serviço.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateOrderSection;
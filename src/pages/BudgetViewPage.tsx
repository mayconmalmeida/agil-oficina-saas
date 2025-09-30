import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, FileText, Download, Check, X, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateBudgetPDF } from '@/utils/pdfUtils';

interface BudgetData {
  id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
}

const BudgetViewPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBudget();
    }
  }, [id]);

  const fetchBudget = async () => {
    if (!id || !user?.id) return;

    try {
      setIsLoading(true);
      
      // Adicionar timeout para evitar travamentos
      const budgetPromise = supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na consulta do orçamento')), 15000);
      });

      const { data, error } = await Promise.race([
        budgetPromise,
        timeoutPromise
      ]) as any;

      if (error) throw error;
      setBudget(data);
    } catch (error: any) {
      console.error('Erro ao carregar orçamento:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message === 'Timeout na consulta do orçamento' 
          ? "A consulta demorou muito para responder. Tente novamente."
          : "Não foi possível carregar o orçamento."
      });
      navigate('/orcamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetStatus = async (newStatus: string) => {
    if (!budget || !user?.id) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: newStatus })
        .eq('id', budget.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudget({ ...budget, status: newStatus });
      
      toast({
        title: "Status atualizado",
        description: `Orçamento marcado como ${newStatus}.`
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status do orçamento."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (!budget) return;
    
    try {
      generateBudgetPDF(budget);
      toast({
        title: "Impressão iniciada",
        description: "O orçamento foi enviado para impressão."
      });
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível gerar o PDF do orçamento."
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Orçamento não encontrado.</p>
        <Button onClick={() => navigate('/orcamentos')} className="mt-4">
          Voltar aos Orçamentos
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/orcamentos')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orçamento #{budget.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">
              Criado em {new Date(budget.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(budget.status)}>
            {budget.status}
          </Badge>
          <Button
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/orcamentos/editar/${budget.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <p className="text-lg font-semibold">{budget.cliente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Veículo</label>
              <p className="text-lg">{budget.veiculo}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(budget.valor_total)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descrição do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
            {budget.descricao}
          </div>
        </CardContent>
      </Card>

      {budget.status === 'pendente' && (
        <Card>
          <CardHeader>
            <CardTitle>Ações do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => updateBudgetStatus('aprovado')}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Aprovar Orçamento
              </Button>
              <Button
                onClick={() => updateBudgetStatus('rejeitado')}
                disabled={isUpdating}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Rejeitar Orçamento
              </Button>
              <Button
                onClick={() => updateBudgetStatus('enviado')}
                disabled={isUpdating}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Marcar como Enviado
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetViewPage;
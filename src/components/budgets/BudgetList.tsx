
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Printer, Mail, ArrowRight, Edit, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatUtils';
import { generateBudgetPDF } from '@/utils/pdfUtils';
import { sendBudgetByEmail, validateEmail } from '@/utils/emailUtils';
import ConvertToServiceOrderDialog from './ConvertToServiceOrderDialog';
import Loading from '@/components/ui/loading';

interface BudgetListProps {
  searchQuery?: string;
  filter?: string;
}

interface Budget {
  id: string;
  numero?: string;
  cliente: string;
  veiculo: string;
  data: string;
  valor: number;
  status: string;
  itens?: number;
  created_at: string;
  valor_total: number;
  descricao: string;
}

const BudgetList: React.FC<BudgetListProps> = ({ 
  searchQuery = '',
  filter = 'todos'
}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailDialog, setEmailDialog] = useState({ open: false, budget: null as Budget | null });
  const [convertDialog, setConvertDialog] = useState({ open: false, budget: null as Budget | null });
  const [emailAddress, setEmailAddress] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchBudgets();
  }, []);
  
  const fetchBudgets = async () => {
    try {
      console.log('Buscando orçamentos...');
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching budgets:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar orçamentos",
          description: "Não foi possível carregar os orçamentos.",
        });
        return;
      }
      
      console.log('Orçamentos encontrados:', data?.length || 0);
      
      if (data && data.length > 0) {
        const formattedBudgets: Budget[] = data.map(item => ({
          id: item.id,
          numero: `ORC-${new Date(item.created_at).getFullYear()}-${item.id.substring(0, 3).toUpperCase()}`,
          cliente: item.cliente,
          veiculo: item.veiculo,
          data: item.created_at,
          valor: typeof item.valor_total === 'string' ? parseFloat(item.valor_total) : item.valor_total,
          status: item.status || 'pendente',
          itens: 0,
          created_at: item.created_at,
          valor_total: typeof item.valor_total === 'string' ? parseFloat(item.valor_total) : item.valor_total,
          descricao: item.descricao
        }));
        
        setBudgets(formattedBudgets);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar os orçamentos.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = !searchQuery || 
      budget.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (budget.numero?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      budget.veiculo.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'todos') return true;
    return budget.status === filter.slice(0, -1);
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'convertido':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Convertido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewBudget = (budgetId: string) => {
    navigate(`/dashboard/orcamentos/${budgetId}`);
  };

  const handleEditBudget = (budgetId: string) => {
    navigate(`/dashboard/orcamentos/editar/${budgetId}`);
  };

  const handlePrintBudget = (budget: Budget) => {
    try {
      generateBudgetPDF(budget);
      toast({
        title: "PDF gerado com sucesso",
        description: "O orçamento foi enviado para impressão.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF do orçamento.",
      });
    }
  };

  const handleEmailBudget = (budget: Budget) => {
    setEmailDialog({ open: true, budget });
    setEmailAddress('');
  };

  const handleWhatsAppBudget = (budget: Budget) => {
    const message = `Olá! Segue o orçamento ${budget.numero}:\n\nCliente: ${budget.cliente}\nVeículo: ${budget.veiculo}\nValor: ${formatCurrency(budget.valor)}\n\nDescrição: ${budget.descricao}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendEmail = async () => {
    if (!emailDialog.budget || !emailAddress) return;
    
    if (!validateEmail(emailAddress)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, digite um endereço de email válido.",
      });
      return;
    }

    setIsEmailSending(true);
    
    try {
      await sendBudgetByEmail({
        budgetId: emailDialog.budget.id,
        clientEmail: emailAddress,
        budgetData: emailDialog.budget
      });

      toast({
        title: "Email enviado com sucesso",
        description: `O orçamento foi enviado para ${emailAddress}`,
      });
      
      setEmailDialog({ open: false, budget: null });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o orçamento por email.",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleConvertToServiceOrder = (budget: Budget) => {
    setConvertDialog({ open: true, budget });
  };

  const handleConfirmConversion = async (data: { startDate: Date; notes: string }) => {
    if (!convertDialog.budget) return;

    setIsConverting(true);
    
    try {
      // Update budget status to 'convertido'
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'convertido' })
        .eq('id', convertDialog.budget.id);

      if (error) throw error;

      toast({
        title: "Orçamento convertido",
        description: "O orçamento foi convertido para ordem de serviço com sucesso.",
      });
      
      setConvertDialog({ open: false, budget: null });
      fetchBudgets(); // Refresh the list
    } catch (error) {
      console.error('Error converting budget:', error);
      toast({
        variant: "destructive",
        title: "Erro na conversão",
        description: "Não foi possível converter o orçamento para ordem de serviço.",
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  if (loading) {
    return <Loading text="Carregando orçamentos..." />;
  }
  
  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Veículo</TableHead>
              <TableHead className="hidden md:table-cell">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.numero || `-`}</TableCell>
                <TableCell>{budget.cliente}</TableCell>
                <TableCell className="hidden md:table-cell">{budget.veiculo}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(budget.data)}</TableCell>
                <TableCell className="text-right">{formatCurrency(budget.valor)}</TableCell>
                <TableCell>{getStatusBadge(budget.status)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Ver detalhes"
                      onClick={() => handleViewBudget(budget.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Editar"
                      onClick={() => handleEditBudget(budget.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Imprimir"
                      onClick={() => handlePrintBudget(budget)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Enviar por email"
                      onClick={() => handleEmailBudget(budget)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Enviar por WhatsApp"
                      onClick={() => handleWhatsAppBudget(budget)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    {budget.status === 'aprovado' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Converter para ordem de serviço"
                        onClick={() => handleConvertToServiceOrder(budget)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredBudgets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery || filter !== 'todos' 
                    ? 'Nenhum orçamento encontrado com os filtros aplicados.' 
                    : 'Nenhum orçamento cadastrado ainda. Clique em "Novo Orçamento" para começar.'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialog.open} onOpenChange={(open) => !open && setEmailDialog({ open: false, budget: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Orçamento por Email</DialogTitle>
            <DialogDescription>
              Digite o endereço de email para enviar o orçamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Endereço de Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog({ open: false, budget: null })}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={isEmailSending || !emailAddress}>
              {isEmailSending ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Service Order Dialog */}
      <ConvertToServiceOrderDialog
        isOpen={convertDialog.open}
        onClose={() => setConvertDialog({ open: false, budget: null })}
        onConfirm={handleConfirmConversion}
        budgetData={convertDialog.budget}
        isLoading={isConverting}
      />
    </>
  );
};

export default BudgetList;

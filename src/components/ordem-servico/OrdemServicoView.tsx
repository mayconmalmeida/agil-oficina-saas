
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  Share, 
  Mail, 
  CreditCard, 
  User, 
  Calendar, 
  Car,
  FileText,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateServiceOrderPDF } from '@/utils/pdfUtils';

interface OrdemServico {
  id: string;
  cliente_id: string;
  data_inicio: string;
  data_fim?: string;
  status: string;
  observacoes?: string;
  valor_total: number;
  cliente_nome?: string;
  veiculo_info?: string;
  servicos?: Array<{
    nome: string;
    valor: number;
    quantidade: number;
  }>;
}

interface OrdemServicoViewProps {
  ordem: OrdemServico;
  onStatusChange: (novoStatus: string) => void;
  onEdit?: () => void;
}

const OrdemServicoView: React.FC<OrdemServicoViewProps> = ({
  ordem,
  onStatusChange,
  onEdit
}) => {
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const statusOptions = [
    'Aberto',
    'Aprovado',
    'Em Andamento',
    'Aguardando Peças',
    'Finalizado',
    'Cancelado'
  ];

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

  const handleImprimirPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      generateServiceOrderPDF(ordem);
      toast({
        title: "PDF gerado com sucesso",
        description: "A ordem de serviço foi preparada para impressão.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF da ordem de serviço.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCompartilharWhatsApp = async () => {
    try {
      const texto = `*Ordem de Serviço #${ordem.id.slice(0, 8)}*\n\nCliente: ${ordem.cliente_nome}\nStatus: ${ordem.status}\nValor: R$ ${ordem.valor_total.toFixed(2)}`;
      const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao compartilhar",
        description: "Não foi possível abrir o WhatsApp.",
      });
    }
  };

  const handleEnviarEmail = () => {
    const subject = `Ordem de Serviço #${ordem.id.slice(0, 8)}`;
    const body = `Ordem de Serviço para ${ordem.cliente_nome}\n\nStatus: ${ordem.status}\nValor Total: R$ ${ordem.valor_total.toFixed(2)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleGerarPagamento = () => {
    // Redirecionar para tela de registro manual de pagamento
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A tela de pagamento manual será implementada em breve.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Ordem de Serviço #{ordem.id.slice(0, 8)}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Criada em {new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(ordem.status)}>
                {ordem.status}
              </Badge>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{ordem.cliente_nome}</p>
                  <p className="text-sm text-gray-600">Cliente</p>
                </div>
              </div>

              {ordem.veiculo_info && (
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{ordem.veiculo_info}</p>
                    <p className="text-sm text-gray-600">Veículo</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}
                    {ordem.data_fim && ` - ${new Date(ordem.data_fim).toLocaleDateString('pt-BR')}`}
                  </p>
                  <p className="text-sm text-gray-600">Período de execução</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Alterar Status
                </label>
                <Select value={ordem.status} onValueChange={onStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {ordem.valor_total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {ordem.observacoes && (
            <>
              <Separator className="my-6" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">Observações</h3>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {ordem.observacoes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={handleImprimirPDF}
              disabled={isGeneratingPDF}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Printer className="h-6 w-6" />
              <span className="text-sm">Imprimir A4</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleCompartilharWhatsApp}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Share className="h-6 w-6" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleEnviarEmail}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Mail className="h-6 w-6" />
              <span className="text-sm">Enviar Email</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleGerarPagamento}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Gerar Pagamento</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdemServicoView;

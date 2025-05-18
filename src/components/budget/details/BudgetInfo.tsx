
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BudgetInfoProps {
  id: string;
  cliente: string;
  veiculo: string;
  created_at: string;
  valor_total: number;
  descricao: string;
  status: string;
}

const BudgetInfo: React.FC<BudgetInfoProps> = ({
  id,
  cliente,
  veiculo,
  created_at,
  valor_total,
  descricao,
  status
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'concluído': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Orçamento #{id.substring(0, 8)}</CardTitle>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Informações do Cliente</h3>
            <p><span className="font-medium">Nome:</span> {cliente}</p>
            <p><span className="font-medium">Veículo:</span> {veiculo}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Informações do Orçamento</h3>
            <p><span className="font-medium">Data:</span> {formatDate(created_at)}</p>
            <p><span className="font-medium">Valor Total:</span> {formatCurrency(valor_total)}</p>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-lg mb-2">Descrição dos Serviços</h3>
          <p>{descricao}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetInfo;

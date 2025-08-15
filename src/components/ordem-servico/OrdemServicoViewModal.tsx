
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/supabaseTypes';

interface OrdemServico {
  id: string;
  cliente_id: string;
  orcamento_id?: string;
  status: string;
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
  valor_total: number;
  cliente_nome?: string;
  orcamento_descricao?: string;
}

interface OrdemServicoViewModalProps {
  ordem: OrdemServico | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrdemServicoViewModal: React.FC<OrdemServicoViewModalProps> = ({
  ordem,
  isOpen,
  onClose
}) => {
  if (!ordem) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberta': return 'bg-blue-100 text-blue-800';
      case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Concluída': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Ordem de Serviço #{ordem.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <Badge className={getStatusColor(ordem.status)}>
              {ordem.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Cliente:</label>
              <p className="text-lg">{ordem.cliente_nome || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Valor Total:</label>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(ordem.valor_total)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Data de Início:</label>
              <p className="text-lg">{new Date(ordem.data_inicio).toLocaleDateString('pt-BR')}</p>
            </div>

            {ordem.data_fim && (
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Fim:</label>
                <p className="text-lg">{new Date(ordem.data_fim).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>

          {ordem.orcamento_descricao && (
            <div>
              <label className="text-sm font-medium text-gray-600">Orçamento Vinculado:</label>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{ordem.orcamento_descricao}</p>
            </div>
          )}

          {ordem.observacoes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Observações:</label>
              <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {ordem.observacoes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrdemServicoViewModal;

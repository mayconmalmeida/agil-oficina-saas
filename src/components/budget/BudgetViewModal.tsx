
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Printer, Mail } from 'lucide-react';

interface BudgetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: any;
  onEdit: () => void;
}

const BudgetViewModal: React.FC<BudgetViewModalProps> = ({
  isOpen,
  onClose,
  budget,
  onEdit
}) => {
  if (!budget) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-800';
      case 'Rejeitado': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Detalhes do Orçamento</DialogTitle>
            <Badge className={getStatusColor(budget.status || 'Pendente')}>
              {budget.status || 'Pendente'}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Cliente</label>
              <p className="text-gray-900">{budget.cliente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Veículo</label>
              <p className="text-gray-900">{budget.veiculo}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Descrição</label>
            <p className="text-gray-900 mt-1">{budget.descricao}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Valor Total</label>
              <p className="text-2xl font-bold text-green-600">
                R$ {Number(budget.valor_total || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Data de Criação</label>
              <p className="text-gray-900">
                {new Date(budget.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between pt-6 border-t">
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Enviar por E-mail
              </Button>
            </div>
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetViewModal;

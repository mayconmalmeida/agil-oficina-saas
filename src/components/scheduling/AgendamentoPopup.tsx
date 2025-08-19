
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Car, Wrench, FileText, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Agendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  cliente_id: string;
  servico_id: string;
  observacoes?: string;
  status: string;
  clients?: { nome: string; telefone: string };
  services?: { nome: string };
}

interface AgendamentoPopupProps {
  agendamento: Agendamento | null;
  isOpen: boolean;
  onClose: () => void;
}

const AgendamentoPopup: React.FC<AgendamentoPopupProps> = ({
  agendamento,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  if (!agendamento) return null;

  const handleVerOS = () => {
    // Navegar para a página da OS - assumindo que existe uma OS relacionada
    navigate(`/dashboard/ordem-servico/${agendamento.id}`);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo do Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <Badge className={getStatusColor(agendamento.status)}>
              {agendamento.status}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')} às {agendamento.horario}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{agendamento.clients?.nome}</p>
                <p className="text-xs text-gray-500">{agendamento.clients?.telefone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{agendamento.services?.nome}</span>
            </div>

            {agendamento.observacoes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">{agendamento.observacoes}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleVerOS} className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              Ver OS Completa
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendamentoPopup;

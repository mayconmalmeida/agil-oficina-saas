
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Car, Wrench, Eye, X } from 'lucide-react';
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
    navigate(`/dashboard/ordem-servico/${agendamento.id}`);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Agendamento</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status */}
          <div className="flex justify-center">
            <Badge className={getStatusColor(agendamento.status)}>
              {agendamento.status.toUpperCase()}
            </Badge>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="font-medium">
                  {new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Horário</p>
                <p className="font-medium">{agendamento.horario}</p>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium">{agendamento.clients?.nome || 'N/A'}</p>
              {agendamento.clients?.telefone && (
                <div className="flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600">{agendamento.clients.telefone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Serviço */}
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Serviço</p>
              <p className="font-medium">{agendamento.services?.nome || 'N/A'}</p>
            </div>
          </div>

          {/* Observações */}
          {agendamento.observacoes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Observações</p>
              <p className="text-sm bg-gray-50 p-2 rounded border">
                {agendamento.observacoes}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Fechar
            </Button>
            <Button className="flex-1" onClick={handleVerOS}>
              <Eye className="mr-2 h-4 w-4" />
              Ver OS
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendamentoPopup;

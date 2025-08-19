
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import AgendamentoPopup from './AgendamentoPopup';

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

interface CalendarioInterativoProps {
  agendamentos: Agendamento[];
}

const CalendarioInterativo: React.FC<CalendarioInterativoProps> = ({ agendamentos }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const agendamentosPorData = selectedDate 
    ? agendamentos.filter(agendamento => {
        const agendamentoDate = new Date(agendamento.data_agendamento);
        return agendamentoDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  const handleAgendamentoClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsPopupOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border-0"
            modifiers={{
              hasAgendamentos: agendamentos.map(a => new Date(a.data_agendamento))
            }}
            modifiersStyles={{
              hasAgendamentos: { 
                backgroundColor: 'rgb(59 130 246 / 0.1)',
                color: 'rgb(29 78 216)'
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos - {selectedDate?.toLocaleDateString('pt-BR')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosPorData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para esta data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentosPorData
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((agendamento) => (
                <div
                  key={agendamento.id}
                  onClick={() => handleAgendamentoClick(agendamento)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{agendamento.horario}</span>
                    </div>
                    <Badge className={getStatusColor(agendamento.status)}>
                      {agendamento.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{agendamento.clients?.nome}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {agendamento.services?.nome}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AgendamentoPopup
        agendamento={selectedAgendamento}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default CalendarioInterativo;


import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Agendamento, CalendarEvent } from '@/types/agenda';
import { useNavigate } from 'react-router-dom';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const AgendaPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Agendamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAgendamentos = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clients:cliente_id(nome, telefone, veiculo),
          services:servico_id(nome, tipo, valor)
        `)
        .eq('user_id', user.id)
        .order('data_agendamento', { ascending: true });

      if (error) throw error;

      setAgendamentos(data || []);

      // Converter para eventos do calendário
      const calendarEvents: CalendarEvent[] = (data || []).map(agendamento => {
        const [hours, minutes] = agendamento.horario.split(':');
        const startDate = new Date(agendamento.data_agendamento);
        startDate.setHours(parseInt(hours), parseInt(minutes));
        
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        return {
          id: agendamento.id,
          title: `${agendamento.clients?.nome || 'Cliente'} - ${agendamento.services?.nome || 'Serviço'}`,
          start: startDate,
          end: endDate,
          resource: agendamento
        };
      });

      setEvents(calendarEvents);
    } catch (error: any) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os agendamentos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [user?.id]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsModalOpen(true);
  };

  const handleViewOS = () => {
    if (selectedEvent) {
      navigate(`/ordens-servico/${selectedEvent.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: (total: number) => `+${total} mais`
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <Button onClick={() => navigate('/agendamentos/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              onSelectEvent={handleSelectEvent}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              defaultView={Views.MONTH}
              popup
              step={30}
              showMultiDayTimes
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <strong>Cliente:</strong> {selectedEvent.clients?.nome || 'N/A'}
              </div>
              <div>
                <strong>Telefone:</strong> {selectedEvent.clients?.telefone || 'N/A'}
              </div>
              <div>
                <strong>Veículo:</strong> {selectedEvent.clients?.veiculo || 'N/A'}
              </div>
              <div>
                <strong>Serviço:</strong> {selectedEvent.services?.nome || 'N/A'}
              </div>
              <div>
                <strong>Data:</strong> {new Date(selectedEvent.data_agendamento).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <strong>Horário:</strong> {selectedEvent.horario}
              </div>
              <div>
                <strong>Status:</strong>
                <Badge className={`ml-2 ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </Badge>
              </div>
              {selectedEvent.observacoes && (
                <div>
                  <strong>Observações:</strong>
                  <p className="mt-1 text-sm text-gray-600">{selectedEvent.observacoes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={handleViewOS}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver OS
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPage;

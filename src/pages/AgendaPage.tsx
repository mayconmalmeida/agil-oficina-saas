
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Agendamento {
  id: string;
  data_agendamento: string;
  horario: string;
  observacoes?: string;
  status: string;
  clients?: {
    nome: string;
  };
  services?: {
    nome: string;
  };
}

const AgendaPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clients(nome),
          services(nome)
        `)
        .order('data_agendamento', { ascending: true });

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error) {
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

  const events = agendamentos.map(agendamento => {
    const [hours, minutes] = agendamento.horario.split(':').map(Number);
    const date = new Date(agendamento.data_agendamento);
    date.setHours(hours, minutes);
    
    return {
      id: agendamento.id,
      title: `${agendamento.clients?.nome || 'Cliente'} - ${agendamento.services?.nome || 'Serviço'}`,
      start: date,
      end: new Date(date.getTime() + 60 * 60 * 1000), // 1 hora de duração
      resource: agendamento,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Agenda</h1>
        </div>
        <Button onClick={() => navigate('/agendamentos/novo')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="pt-BR"
              messages={{
                next: "Próximo",
                previous: "Anterior",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Agenda",
                date: "Data",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "Não há agendamentos neste período.",
                showMore: (total) => `+ Ver mais (${total})`
              }}
              onSelectEvent={(event) => {
                navigate(`/ordens-servico/${event.resource.id}`);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaPage;

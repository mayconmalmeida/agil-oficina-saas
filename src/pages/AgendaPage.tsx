
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  descricao_servico?: string;
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
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ descricao_servico: '', data_agendamento: '', horario: '', observacoes: '' });
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

  const handleUpdateAgendamento = async () => {
    if (!selectedAgendamento) return;
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({
          descricao_servico: editForm.descricao_servico,
          data_agendamento: editForm.data_agendamento,
          horario: editForm.horario,
          observacoes: editForm.observacoes,
        })
        .eq('id', selectedAgendamento.id);

      if (error) throw error;
      toast({ title: 'Agendamento atualizado', description: 'As alterações foram salvas.' });
      await carregarAgendamentos();
      setIsEditOpen(false);
      setSelectedAgendamento(null);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar as alterações.' });
    }
  };

  const events = agendamentos.map(agendamento => {
    const [hours, minutes] = agendamento.horario.split(':').map(Number);
    const date = new Date(agendamento.data_agendamento);
    date.setHours(hours, minutes);
    
    return {
      id: agendamento.id,
      title: agendamento.descricao_servico || `${agendamento.clients?.nome || 'Cliente'} - ${agendamento.services?.nome || 'Serviço'}`,
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
                const ag = event.resource as Agendamento;
                setSelectedAgendamento(ag);
                setEditForm({
                  descricao_servico: ag.descricao_servico || '',
                  data_agendamento: ag.data_agendamento || '',
                  horario: ag.horario || '',
                  observacoes: ag.observacoes || ''
                });
                setIsEditOpen(true);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setSelectedAgendamento(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="descricao_servico">Título/Descrição</Label>
              <Input id="descricao_servico" value={editForm.descricao_servico} onChange={(e) => setEditForm(prev => ({ ...prev, descricao_servico: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_agendamento">Data</Label>
                <Input id="data_agendamento" type="date" value={editForm.data_agendamento} onChange={(e) => setEditForm(prev => ({ ...prev, data_agendamento: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="horario">Horário</Label>
                <Input id="horario" type="time" value={editForm.horario} onChange={(e) => setEditForm(prev => ({ ...prev, horario: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" value={editForm.observacoes} onChange={(e) => setEditForm(prev => ({ ...prev, observacoes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedAgendamento(null); }}>Cancelar</Button>
              <Button onClick={handleUpdateAgendamento}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPage;
